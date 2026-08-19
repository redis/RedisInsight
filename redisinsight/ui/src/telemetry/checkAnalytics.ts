import { get } from 'lodash'
import { store } from 'uiSrc/slices/store'

// Check is user give access to collect his events
export const checkIsAnalyticsGranted = (): boolean =>
  !!get(store.getState(), 'user.settings.config.agreements.analytics', false)

/**
 * The API's server id: one per installation, or one per deployment in the web
 * build where every user shares it. Undefined until `GET /info` resolves.
 */
export const getInstallationId = (): string | undefined =>
  store.getState().app.info.server?.id
