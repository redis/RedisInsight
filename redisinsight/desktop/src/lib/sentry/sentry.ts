import * as Sentry from '@sentry/electron/main'
import { IPCMode } from '@sentry/electron/main'
import { crashReporter } from 'electron'
import log from 'electron-log'
import { electronStore } from 'desktopSrc/lib/store/store'
import { ElectronStorageItem } from 'uiSrc/electron/constants'
import {
  minimizeEvent,
  scrubEvent,
  scrubSensitiveData,
} from 'uiSrc/services/sentry'
import pkg from '../../../../package.json'
import configInit from '../../../config.json'

let initialized = false

/**
 * Whether the user has granted analytics consent. Default-deny: until consent
 * is known, Sentry runs in the anonymous (Tier 1) mode. Mutated by
 * `setConsent` once the renderer reports the agreement; read by `beforeSend`
 * per-event so the decision is made at send time.
 *
 * See docs/sentry-production-readiness.md (§3, §5).
 */
let consentGranted = false

/** Native crash uploader is start-once per session (Electron has no stop). */
let crashReporterStarted = false

/**
 * Read the consent cached in electron-store. Lets the main process pick the
 * correct tier synchronously at boot (before the agreements DB is available).
 * First-ever run has no value -> false -> Tier 1.
 */
const readCachedConsent = (): boolean =>
  electronStore?.get(ElectronStorageItem.analyticsConsent) === true

/**
 * Parse Sentry DSN to extract components for crashReporter.
 * DSN format: https://{PUBLIC_KEY}@{HOST}/{PROJECT_ID}
 */
const parseDsn = (
  dsn: string,
): { publicKey: string; host: string; projectId: string } | null => {
  const match = dsn.match(/https:\/\/([^@]+)@([^/]+)\/(\d+)/)
  if (!match) return null

  const [, publicKey, host, projectId] = match
  return { publicKey, host, projectId }
}

/**
 * Configure Electron's crashReporter to send native crash minidumps to Sentry.
 */
const initCrashReporter = (dsn: string, environment: string): void => {
  if (!configInit.crashReporter) {
    log.info('[Sentry] crashReporter disabled in config')
    return
  }

  // Electron's crashReporter can only be started once per session and has no
  // stop API. We therefore only ever start it (when consent is granted) and
  // never restart; native-crash upload toggled off mid-session takes effect on
  // the next launch (which reads cached consent). See readiness doc §5.
  if (crashReporterStarted) {
    return
  }

  const dsnParts = parseDsn(dsn)
  if (!dsnParts) {
    log.warn('[Sentry] Failed to parse DSN for crashReporter')
    return
  }

  const { publicKey, host, projectId } = dsnParts
  const minidumpUrl = `https://${host}/api/${projectId}/minidump/?sentry_key=${publicKey}`

  crashReporter.start({
    submitURL: minidumpUrl,
    productName: 'Redis Insight',
    companyName: 'Redis',
    uploadToServer: true,
    extra: {
      environment,
      release: pkg.version,
    },
  })

  crashReporterStarted = true
  log.info('[Sentry] crashReporter configured for native crash reporting')
}

/**
 * Initialize Sentry for Electron main process.
 *
 * Configuration via environment variables:
 * - RI_SENTRY_ENABLED: 'true' to enable
 * - RI_SENTRY_DSN: Sentry DSN
 * - RI_SENTRY_ENVIRONMENT: Environment name (default: 'development')
 */
export const initSentry = (): void => {
  if (initialized) {
    return
  }

  const dsn = process.env.RI_SENTRY_DSN
  const enabled = process.env.RI_SENTRY_ENABLED === 'true'
  const environment = process.env.RI_SENTRY_ENVIRONMENT || 'development'

  if (!enabled || !dsn) {
    log.info('[Sentry] Disabled or DSN not configured')
    return
  }

  consentGranted = readCachedConsent()

  try {
    Sentry.init({
      dsn,
      environment,
      release: pkg.version,
      ipcMode: IPCMode.Classic,
      initialScope: { tags: { 'app.layer': 'electron-main' } },
      // Do not attach IP / machine identifiers.
      sendDefaultPii: false,
      serverName: 'redacted',
      // Breadcrumbs (console / requests / navigation) can carry sensitive data,
      // so only keep them when consent is granted.
      beforeBreadcrumb: (breadcrumb) => (consentGranted ? breadcrumb : null),
      beforeSend(event) {
        const scrubbed = scrubEvent(event)
        // No consent -> reduce to the anonymous Tier 1 allowlist.
        return consentGranted ? scrubbed : minimizeEvent(scrubbed)
      },
    })

    // Native minidumps cannot be scrubbed (they capture process memory), so the
    // uploader is only started when consent is granted.
    if (consentGranted) {
      initCrashReporter(dsn, environment)
    }

    initialized = true
    log.info(
      `[Sentry] Initialized for environment: ${environment} (consent: ${consentGranted})`,
    )
  } catch (error) {
    log.error('[Sentry] Failed to initialize:', error)
  }
}

/**
 * Update analytics consent at runtime. Flips the tier used by `beforeSend`,
 * persists the value for the next boot, and starts the native crash uploader
 * when consent is granted. On revoke the client is NOT closed — anonymous
 * Tier 1 reporting continues and `beforeSend` minimizes every event.
 *
 * See docs/sentry-production-readiness.md (§3, §5).
 */
export const setConsent = (granted: boolean): void => {
  consentGranted = granted
  electronStore?.set(ElectronStorageItem.analyticsConsent, granted)

  if (!initialized) {
    return
  }

  // On grant, start the native crash uploader (start-once). On revoke we do
  // NOT close the client — Tier 1 anonymous reporting continues without
  // consent; `beforeSend` minimizes every event while `consentGranted` is
  // false. (The already-started crashReporter cannot be stopped mid-session;
  // it respects cached consent on next launch.)
  if (granted) {
    const dsn = process.env.RI_SENTRY_DSN
    const environment = process.env.RI_SENTRY_ENVIRONMENT || 'development'
    if (dsn) {
      initCrashReporter(dsn, environment)
    }
  }

  log.info(`[Sentry] Consent updated: ${granted}`)
}

/**
 * Capture an exception and send to Sentry
 */
export const captureException = (
  error: Error,
  context?: Record<string, unknown>,
): string | undefined => {
  if (!initialized) {
    return undefined
  }

  return Sentry.captureException(error, {
    extra: context
      ? (scrubSensitiveData(context) as Record<string, unknown>)
      : undefined,
  })
}

/**
 * Set user context for Sentry
 */
export const setUser = (anonymousId: string): void => {
  if (!initialized) {
    return
  }

  Sentry.setUser({ id: anonymousId })
}

/**
 * Check if Sentry is initialized
 */
export const isSentryInitialized = (): boolean => initialized
