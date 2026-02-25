import * as Sentry from '@sentry/electron/main'
import log from 'electron-log'
import pkg from '../../../../package.json'

/**
 * List of sensitive field names to scrub from error reports
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
]

let initialized = false

/**
 * Scrub sensitive data from objects before sending to Sentry
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
    const isSensitive = SENSITIVE_FIELDS.some(
      (field) =>
        lowerKey.includes(field.toLowerCase()) ||
        lowerKey === field.toLowerCase(),
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
 * Initialize Sentry for Electron main process
 */
export const initSentry = (): void => {
  if (initialized) {
    return
  }

  const dsn = process.env.RI_SENTRY_ELECTRON_DSN
  const enabled = process.env.RI_SENTRY_ENABLED === 'true'
  const environment = process.env.RI_SENTRY_ENVIRONMENT || 'development'
  const sampleRate = parseFloat(process.env.RI_SENTRY_SAMPLE_RATE || '1.0')
  const tracesSampleRate = parseFloat(
    process.env.RI_SENTRY_TRACES_SAMPLE_RATE || '0.1',
  )

  if (!enabled || !dsn) {
    log.info('[Sentry] Disabled or DSN not configured')
    return
  }

  try {
    Sentry.init({
      dsn,
      environment,
      release: pkg.version,
      sampleRate,
      tracesSampleRate,
      beforeSend(event) {
        // Scrub sensitive data
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
