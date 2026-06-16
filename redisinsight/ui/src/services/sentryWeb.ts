import * as Sentry from '@sentry/react'

import { getConfig } from 'uiSrc/config'
import { checkIsAnalyticsGranted } from 'uiSrc/telemetry/checkAnalytics'
import { minimizeEvent, scrubEvent } from 'uiSrc/services/sentry'

const riConfig = getConfig()

/**
 * Initialize Sentry for the web build (`index.tsx`). Uses `@sentry/react`
 * directly (the Electron renderer uses `@sentry/electron/renderer` instead).
 *
 * Same two-tier model as the Electron renderer: consent is evaluated per-event
 * via `checkIsAnalyticsGranted`, so without consent events are reduced to the
 * anonymous Tier 1 allowlist and breadcrumbs are dropped; with consent the full
 * (still secret-scrubbed) event is sent.
 *
 * See docs/sentry-production-readiness.md (§3, §4).
 */
export const initSentry = (): void => {
  const { sentry, app } = riConfig

  if (!sentry.enabled || !sentry.dsn) {
    console.warn('[Sentry] Disabled or DSN not configured')
    return
  }

  Sentry.init({
    dsn: sentry.dsn,
    environment: sentry.environment,
    // Must match the release the Vite plugin uploads maps under
    // (`defaultConfig.app.version`), otherwise web events won't symbolicate.
    release: app.version,
    initialScope: { tags: { 'app.layer': 'web' } },
    sendDefaultPii: false,
    beforeBreadcrumb: (breadcrumb) =>
      checkIsAnalyticsGranted() ? breadcrumb : null,
    beforeSend(event) {
      const scrubbed = scrubEvent(event)
      return checkIsAnalyticsGranted() ? scrubbed : minimizeEvent(scrubbed)
    },
  })
}
