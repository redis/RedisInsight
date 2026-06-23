import * as Sentry from '@sentry/react'

import { getConfig } from 'uiSrc/config'
import { checkIsAnalyticsGranted } from 'uiSrc/telemetry/checkAnalytics'
import { minimizeEvent, scrubEvent } from 'uiSrc/services/sentry'

const riConfig = getConfig()

/**
 * Initialize Sentry for the web build. Consent is evaluated per-event, so
 * without consent events are reduced to the anonymous Tier 1 allowlist.
 */
export const initSentry = (): void => {
  const { sentry, app } = riConfig

  if (!sentry.enabled || !sentry.dsn) {
    console.warn('[Sentry] Disabled or DSN not configured')
    return
  }

  try {
    Sentry.init({
      dsn: sentry.dsn,
      environment: sentry.environment,
      // Match the release the Vite plugin uploads maps under.
      release: app.version,
      initialScope: { tags: { 'app.layer': 'web' } },
      sendDefaultPii: false,
      // Sessions bypass beforeSend, so they would report without consent.
      integrations: (defaults) =>
        defaults.filter((integration) => integration.name !== 'BrowserSession'),
      beforeBreadcrumb: (breadcrumb) =>
        checkIsAnalyticsGranted() ? breadcrumb : null,
      beforeSend(event) {
        const scrubbed = scrubEvent(event)
        return checkIsAnalyticsGranted() ? scrubbed : minimizeEvent(scrubbed)
      },
    })
  } catch (e) {
    console.warn('[Sentry] init failed (continuing without Sentry):', e)
  }
}
