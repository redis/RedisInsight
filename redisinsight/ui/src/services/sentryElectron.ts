import * as Sentry from '@sentry/electron/renderer'
import { init as reactInit } from '@sentry/react'

import { getConfig } from 'uiSrc/config'
import {
  checkIsAnalyticsGranted,
  getInstallationId,
} from 'uiSrc/telemetry/checkAnalytics'
import { finalizeSentryEvent } from 'uiSrc/services/sentry'

const riConfig = getConfig()

/**
 * Initialize Sentry for the Electron renderer (@sentry/electron/renderer +
 * @sentry/react). Consent is evaluated per-event, so without consent events are
 * reduced to the anonymous Tier 1 allowlist.
 */
export const initSentry = (): void => {
  const { sentry, app } = riConfig

  if (!sentry.enabled || !sentry.dsn) {
    console.warn('[Sentry] Disabled or DSN not configured')
    return
  }

  try {
    Sentry.init(
      {
        dsn: sentry.dsn,
        environment: sentry.environment,
        // Match the release the Vite plugin uploads maps under.
        release: app.version,
        initialScope: { tags: { 'app.layer': 'electron-renderer' } },
        sendDefaultPii: false,
        // Sessions bypass beforeSend, so they would report without consent.
        integrations: (defaults) =>
          defaults.filter(
            (integration) => integration.name !== 'BrowserSession',
          ),
        beforeBreadcrumb: (breadcrumb) =>
          checkIsAnalyticsGranted() ? breadcrumb : null,
        beforeSend(event) {
          return finalizeSentryEvent(
            event,
            checkIsAnalyticsGranted(),
            getInstallationId(),
          )
        },
      },
      reactInit,
    )
  } catch (e) {
    console.warn('[Sentry] init failed (continuing without Sentry):', e)
  }
}
