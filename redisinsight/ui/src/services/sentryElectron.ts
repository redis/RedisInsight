import * as Sentry from '@sentry/electron/renderer'
import { init as reactInit } from '@sentry/react'

import { getConfig } from 'uiSrc/config'
import pkg from '../../../package.json'

const riConfig = getConfig()

/**
 * Initialize Sentry for the Electron renderer process.
 * Uses @sentry/electron/renderer combined with @sentry/react for React integration.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/electron/#using-framework-specific-sdks
 */
export const initSentry = (): void => {
  const { sentry } = riConfig

  if (!sentry.enabled || !sentry.dsn) {
    // eslint-disable-next-line no-console
    console.log('[Sentry] Disabled or DSN not configured')
    return
  }

  Sentry.init(
    {
      dsn: sentry.dsn,
      environment: sentry.environment,
      release: pkg.version,
    },
    reactInit,
  )

  // eslint-disable-next-line no-console
  console.log(`[Sentry] Electron renderer initialized`)
}
