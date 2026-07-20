import * as Sentry from '@sentry/electron/main'
import { IPCMode } from '@sentry/electron/main'
import { crashReporter } from 'electron'
import log from 'electron-log'
import { electronStore } from 'desktopSrc/lib/store/store'
import { ElectronStorageItem } from 'uiSrc/electron/constants'
import { minimizeEvent, scrubEvent } from 'uiSrc/services/sentry'
import pkg from '../../../../package.json'
import configInit from '../../../config.json'

let initialized = false

/** Analytics consent. Default-deny until the renderer syncs it; read per-event by `beforeSend`. */
let consentGranted = false

let crashReporterStarted = false

/** Cached consent, so the main process can pick the tier at boot. */
const readCachedConsent = (): boolean =>
  electronStore?.get(ElectronStorageItem.analyticsConsent) === true

/** Parse a Sentry DSN: https://{PUBLIC_KEY}@{HOST}/{PROJECT_ID}. */
const parseDsn = (
  dsn: string,
): { publicKey: string; host: string; projectId: string } | null => {
  const match = dsn.match(/https:\/\/([^@]+)@([^/]+)\/(\d+)/)
  if (!match) return null

  const [, publicKey, host, projectId] = match
  return { publicKey, host, projectId }
}

const initCrashReporter = (dsn: string, environment: string): void => {
  if (!configInit.crashReporter) {
    log.info('[Sentry] crashReporter disabled in config')
    return
  }

  // crashReporter is unsupported in sandboxed Mac App Store builds.
  if (process.mas) {
    log.info('[Sentry] Skipping native crashReporter in MAS build')
    return
  }

  // Start at most once; consent changes toggle uploads instead (see setConsent).
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

/** Initialize Sentry for the Electron main process (gated on RI_SENTRY_ENABLED + RI_SENTRY_DSN). */
export const initSentry = (): void => {
  if (initialized) {
    return
  }

  const dsn = process.env.RI_SENTRY_DSN
  // 'true' or '1', matching the renderer/web booleanEnv parsing.
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
      // Drop defaults that bypass the consent gate: the minidump integrations
      // upload native dumps regardless of consent (handled instead by the
      // consent-gated crashReporter), and the session integration emits
      // release-health telemetry without consent.
      integrations: (defaults) =>
        defaults.filter(
          (integration) =>
            integration.name !== 'SentryMinidump' &&
            integration.name !== 'ElectronMinidump' &&
            integration.name !== 'MainProcessSession',
        ),
      initialScope: { tags: { 'app.layer': 'electron-main' } },
      sendDefaultPii: false,
      serverName: 'redacted',
      // Breadcrumbs can carry sensitive data; keep only with consent.
      beforeBreadcrumb: (breadcrumb) => (consentGranted ? breadcrumb : null),
      beforeSend(event) {
        const scrubbed = scrubEvent(event)
        return consentGranted ? scrubbed : minimizeEvent(scrubbed)
      },
    })

    // Minidumps can't be scrubbed, so start the uploader only with consent.
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
 * Update analytics consent at runtime: flips the `beforeSend` tier, persists it
 * for the next boot, and toggles native crash uploads. Revoke does not close the
 * client — anonymous Tier 1 reporting continues.
 */
export const setConsent = (granted: boolean): void => {
  consentGranted = granted
  electronStore?.set(ElectronStorageItem.analyticsConsent, granted)

  if (!initialized) {
    return
  }

  // crashReporter has no stop API, but uploads can be toggled: start on first
  // grant, then enable/disable uploads as consent changes.
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
