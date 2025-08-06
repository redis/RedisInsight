import { get } from 'lodash'
import { store } from 'uiSrc/slices/store'

// Check is user give access to collect his events
export const checkIsAnalyticsGranted = (): boolean =>
  !!get(store.getState(), 'user.settings.config.agreements.analytics', false)
