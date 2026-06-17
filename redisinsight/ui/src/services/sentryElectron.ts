import * as Sentry from '@sentry/electron/renderer'
import { init as reactInit } from '@sentry/react'

import { getConfig } from 'uiSrc/config'
import { checkIsAnalyticsGranted } from 'uiSrc/telemetry/checkAnalytics'
import { minimizeEvent, scrubEvent } from 'uiSrc/services/sentry'

const riConfig = getConfig()

/**
 * Initialize Sentry for the Electron renderer process.
 * Uses @sentry/electron/renderer combined with @sentry/react for React integration.
 *
 * Consent is evaluated per-event via `checkIsAnalyticsGranted` (a live Redux
 * read), so toggling analytics consent takes effect immediately without
 * re-init: without consent, events are reduced to the anonymous Tier 1
 * allowlist and breadcrumbs are dropped; with consent, the full (still
 * secret-scrubbed) event is sent.
 *
 * See docs/sentry-production-readiness.md (§3, §4).
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/electron/#using-framework-specific-sdks
 */
export const initSentry = (): void => {
  const { sentry, app } = riConfig

  if (!sentry.enabled || !sentry.dsn) {
    console.warn('[Sentry] Disabled or DSN not configured')
    return
  }

  Sentry.init(
    {
      dsn: sentry.dsn,
      environment: sentry.environment,
      // Same app-version source as the Vite upload plugin and web init, so
      // renderer events symbolicate against the uploaded maps.
      release: app.version,
      initialScope: { tags: { 'app.layer': 'electron-renderer' } },
      // Do not attach IP / cookies / headers. (`serverName` is a Node-only
      // option; in the renderer `scrubEvent` nulls `server_name` per-event.)
      sendDefaultPii: false,
      // Release-health session envelopes bypass `beforeSend` and would emit
      // usage telemetry without consent — disable session tracking entirely.
      integrations: (defaults) =>
        defaults.filter((integration) => integration.name !== 'BrowserSession'),
      beforeBreadcrumb: (breadcrumb) =>
        checkIsAnalyticsGranted() ? breadcrumb : null,
      beforeSend(event) {
        const scrubbed = scrubEvent(event)
        return checkIsAnalyticsGranted() ? scrubbed : minimizeEvent(scrubbed)
      },
    },
    reactInit,
  )
}
