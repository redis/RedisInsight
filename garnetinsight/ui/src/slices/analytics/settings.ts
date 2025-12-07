import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  AnalyticsViewTab,
  StateAnalyticsSettings,
} from 'uiSrc/slices/interfaces/analytics'
import { RootState } from 'uiSrc/slices/store'

export const initialState: StateAnalyticsSettings = {
  viewTab: AnalyticsViewTab.ClusterDetails,
}

const analyticsSettings = createSlice({
  name: 'analyticsSettings',
  initialState,
  reducers: {
    setInitialAnalyticsSettings: () => initialState,

    setAnalyticsViewTab: (
      state,
      { payload }: PayloadAction<AnalyticsViewTab>,
    ) => {
      state.viewTab = payload
    },
  },
})

export const { setInitialAnalyticsSettings, setAnalyticsViewTab } =
  analyticsSettings.actions

export const analyticsSettingsSelector = (state: RootState) =>
  state.analytics.settings

export default analyticsSettings.reducer
