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

  // Electron's crashReporter is unsupported in sandboxed Mac App Store builds;
  // skip native minidumps there. JS-level Sentry reporting still works.
  if (process.mas) {
    log.info('[Sentry] Skipping native crashReporter in MAS build')
    return
  }

  // Electron's crashReporter can only be started once per session and has no
  // stop API, so we start it at most once (guarded below). Mid-session consent
  // changes are honoured by toggling minidump uploads via `setUploadToServer`
  // in `setConsent`, not by restarting. See readiness doc §5.
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
 * - RI_SENTRY_ENABLED: 'true' or '1' to enable
 * - RI_SENTRY_DSN: Sentry DSN
 * - RI_SENTRY_ENVIRONMENT: Environment name (default: 'development')
 */
export const initSentry = (): void => {
  if (initialized) {
    return
  }

  const dsn = process.env.RI_SENTRY_DSN
  // Match the renderer/web config's `booleanEnv` semantics ('true' OR '1') so
  // the main and renderer layers don't diverge on e.g. RI_SENTRY_ENABLED=1.
  const enabled = ['true', '1'].includes(process.env.RI_SENTRY_ENABLED ?? '')
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
      // Drop default integrations that bypass our consent gate:
      //  - SentryMinidump/ElectronMinidump start Electron's crashReporter and
      //    upload minidumps (process memory) via the SDK transport regardless
      //    of consent; `beforeSend` cannot scrub a minidump attachment. Native
      //    crashes are handled by the consent-gated crashReporter below.
      //  - MainProcessSession emits release-health session envelopes (not
      //    events, so they skip `beforeSend`) — usage telemetry without
      //    consent. We only do crash/error reporting.
      integrations: (defaults) =>
        defaults.filter(
          (integration) =>
            integration.name !== 'SentryMinidump' &&
            integration.name !== 'ElectronMinidump' &&
            integration.name !== 'MainProcessSession',
        ),
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
 * persists the value for the next boot, and toggles native crash reporting.
 * On revoke the client is NOT closed — anonymous Tier 1 reporting continues
 * and `beforeSend` minimizes every event.
 *
 * See docs/sentry-production-readiness.md (§3, §5).
 */
export const setConsent = (granted: boolean): void => {
  consentGranted = granted
  electronStore?.set(ElectronStorageItem.analyticsConsent, granted)

  if (!initialized) {
    return
  }

  // Native crashes: Electron's crashReporter has no stop API, but minidump
  // *uploads* can be toggled at runtime, so consent is honoured immediately in
  // both directions. First grant starts the (consent-gated) reporter; revoke
  // stops uploads; re-grant re-enables them. On revoke we do NOT close the
  // client — Tier 1 anonymous reporting continues and `beforeSend` minimizes
  // every event.
  if (granted) {
    if (crashReporterStarted) {
      crashReporter.setUploadToServer(true)
    } else {
      const dsn = process.env.RI_SENTRY_DSN
      const environment = process.env.RI_SENTRY_ENVIRONMENT || 'development'
      if (dsn) {
        initCrashReporter(dsn, environment)
      }
    }
  } else if (crashReporterStarted) {
    crashReporter.setUploadToServer(false)
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

// =============================================================================
// Test Helpers (TODO: Remove before production release)
// =============================================================================

/**
 * Trigger a test error to verify Sentry integration.
 * TODO: Remove before production release.
 */
export const triggerTestCrash = (): void => {
  if (!initialized) {
    log.warn('[Sentry] Cannot trigger test crash - Sentry not initialized')
    return
  }

  log.info('[Sentry] Triggering test crash for Electron main process')
  // NOTE: a synchronous `throw` from within a globalShortcut/native callback is
  // swallowed by Electron's native dispatch and never reaches Sentry's
  // uncaughtException handler. Capture explicitly so the event is reported
  // without crashing the app.
  captureException(new Error('Sentry test crash - Electron main process'))
}

/**
 * Trigger a native crash to test crashReporter integration.
 * WARNING: This will immediately crash the app!
 * TODO: Remove before production release.
 */
export const triggerNativeCrash = (): void => {
  if (!initialized) {
    log.warn('[Sentry] Cannot trigger native crash - Sentry not initialized')
    return
  }

  log.info('[Sentry] Triggering native crash via process.crash()')
  process.crash()
}
