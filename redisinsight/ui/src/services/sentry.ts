import * as Sentry from '@sentry/react'
import { getConfig } from 'uiSrc/config'
import { checkIsAnalyticsGranted } from 'uiSrc/telemetry/checkAnalytics'

const riConfig = getConfig()

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
 * Initialize Sentry for the UI layer
 */
export const initSentry = (): void => {
  if (initialized) {
    return
  }

  const { sentry } = riConfig

  if (!sentry.enabled || !sentry.dsn) {
    // eslint-disable-next-line no-console
    console.log('[Sentry] Disabled or DSN not configured')
    return
  }

  try {
    Sentry.init({
      dsn: sentry.dsn,
      environment: sentry.environment,
      release: riConfig.app.version,
      sampleRate: sentry.sampleRate,
      tracesSampleRate: sentry.tracesSampleRate,
      beforeSend(event) {
        // Check consent before sending - if user hasn't granted analytics, don't send
        if (!checkIsAnalyticsGranted()) {
          return null
        }

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
    // eslint-disable-next-line no-console
    console.log(`[Sentry] Initialized for environment: ${sentry.environment}`)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Sentry] Failed to initialize:', error)
  }
}

/**
 * Capture an exception and send to Sentry
 */
export const captureException = (
  error: Error,
  context?: Record<string, unknown>,
): string | undefined => {
  if (!initialized || !riConfig.sentry.enabled) {
    return undefined
  }

  // Check consent before capturing
  if (!checkIsAnalyticsGranted()) {
    return undefined
  }

  return Sentry.captureException(error, {
    extra: context
      ? (scrubSensitiveData(context) as Record<string, unknown>)
      : undefined,
  })
}

/**
 * Set anonymous user ID for Sentry
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
