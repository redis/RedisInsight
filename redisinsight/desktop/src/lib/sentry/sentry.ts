import * as Sentry from '@sentry/electron/main'
import { IPCMode } from '@sentry/electron/main'
import { crashReporter } from 'electron'
import log from 'electron-log'
import pkg from '../../../../package.json'
import configInit from '../../../config.json'

/**
 * Sensitive field names to scrub from error reports.
 * Fields containing these substrings (case-insensitive) will be redacted.
 */
const SENSITIVE_FIELDS = [
  'password',
  'pass',
  'secret',
  'token',
  'apiKey',
  'api_key',
  'privateKey',
  'private_key',
  'certificate',
  'cert',
  'clientCert',
  'clientKey',
  'caCert',
  'sshPassphrase',
  'sshPrivateKey',
  'sentinelPassword',
  'passphrase',
]

let initialized = false

/**
 * Recursively scrub sensitive data from objects before sending to Sentry.
 */
const scrubSensitiveData = (obj: unknown): unknown => {
  if (!obj || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => scrubSensitiveData(item))
  }

  const scrubbed: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase()
    const isSensitive = SENSITIVE_FIELDS.some((field) =>
      lowerKey.includes(field),
    )

    if (isSensitive) {
      scrubbed[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      scrubbed[key] = scrubSensitiveData(value)
    } else {
      scrubbed[key] = value
    }
  }

  return scrubbed
}

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

  log.info('[Sentry] crashReporter configured for native crash reporting')
}

/**
 * Initialize Sentry for Electron main process.
 *
 * Configuration via environment variables:
 * - RI_SENTRY_ENABLED: 'true' to enable
 * - RI_SENTRY_ELECTRON_DSN: Sentry DSN
 * - RI_SENTRY_ENVIRONMENT: Environment name (default: 'production')
 */
export const initSentry = (): void => {
  if (initialized) {
    return
  }

  const dsn = process.env.RI_SENTRY_ELECTRON_DSN
  const enabled = process.env.RI_SENTRY_ENABLED === 'true'
  const environment = process.env.RI_SENTRY_ENVIRONMENT || 'development'

  if (!enabled || !dsn) {
    log.info('[Sentry] Disabled or DSN not configured')
    return
  }

  try {
    Sentry.init({
      dsn,
      environment,
      release: pkg.version,
      ipcMode: IPCMode.Classic,
      beforeSend(event) {
        if (event.extra) {
          event.extra = scrubSensitiveData(event.extra) as Record<
            string,
            unknown
          >
        }
        if (event.contexts) {
          event.contexts = scrubSensitiveData(
            event.contexts,
          ) as typeof event.contexts
        }
        return event
      },
    })

    initCrashReporter(dsn, environment)

    initialized = true
    log.info(`[Sentry] Initialized for environment: ${environment}`)
  } catch (error) {
    log.error('[Sentry] Failed to initialize:', error)
  }
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
  throw new Error('Sentry test crash - Electron main process')
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
