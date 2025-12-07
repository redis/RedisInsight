import { createSlice } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { apiService, localStorageService } from 'uiSrc/services'
import { ApiEndpoints, BrowserStorageItem } from 'uiSrc/constants'
import { getApiErrorMessage, isStatusSuccessful } from 'uiSrc/utils'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import {
  GetAgreementsSpecResponse,
  GetAppSettingsResponse,
  UpdateSettingsDto,
} from 'apiSrc/modules/settings/dto/settings.dto'

import { AppDispatch, RootState } from '../store'
import { StateUserSettings } from '../interfaces/user'

export const initialState: StateUserSettings = {
  loading: false,
  error: '',
  isShowConceptsPopup: null,
  config: null,
  spec: null,
  workbench: {
    cleanup: localStorageService?.get(BrowserStorageItem.wbCleanUp) ?? true,
  },
}

// A slice for recipes
const userSettingsSlice = createSlice({
  name: 'userSettings',
  initialState,
  reducers: {
    setUserSettingsInitialState: () => initialState,
    setSettingsPopupState: (state, { payload }) => {
      state.isShowConceptsPopup = payload
    },
    getUserConfigSettings: (state) => {
      state.loading = true
    },
    getUserConfigSettingsSuccess: (state, { payload }) => {
      state.loading = false
      state.config = payload
    },
    getUserConfigSettingsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    updateUserConfigSettings: (state) => {
      state.loading = true
    },
    updateUserConfigSettingsSuccess: (state, { payload }) => {
      state.loading = false
      state.config = payload
      state.isShowConceptsPopup = false
    },
    updateUserConfigSettingsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    getUserSettingsSpec: (state) => {
      state.loading = true
    },
    getUserSettingsSpecSuccess: (state, { payload }) => {
      state.loading = false
      state.spec = payload
    },
    getUserSettingsSpecFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    setWorkbenchCleanUp: (state, { payload }) => {
      localStorageService.set(BrowserStorageItem.wbCleanUp, payload)
      state.workbench.cleanup = payload
    },
  },
})

// Actions generated from the slice
export const {
  setUserSettingsInitialState,
  setSettingsPopupState,
  getUserConfigSettings,
  getUserConfigSettingsSuccess,
  getUserConfigSettingsFailure,
  updateUserConfigSettings,
  updateUserConfigSettingsSuccess,
  updateUserConfigSettingsFailure,
  getUserSettingsSpec,
  getUserSettingsSpecSuccess,
  getUserSettingsSpecFailure,
  setWorkbenchCleanUp,
} = userSettingsSlice.actions

// A selector
export const userSettingsSelector = (state: RootState) => state.user.settings
export const userSettingsConfigSelector = (state: RootState) =>
  state.user.settings.config
export const userSettingsWBSelector = (state: RootState) =>
  state.user.settings.workbench

// The reducer
export default userSettingsSlice.reducer

// Asynchronous thunk action
export function fetchAppInfo(
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(getUserConfigSettings())

    try {
      const { data, status } = await apiService.get<GetAppSettingsResponse>(
        ApiEndpoints.INFO,
      )

      if (isStatusSuccessful(status)) {
        dispatch(getUserConfigSettingsSuccess(data))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as unknown as AxiosError)
      dispatch(getUserConfigSettingsFailure(errorMessage))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function fetchUserConfigSettings(
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(getUserConfigSettings())

    try {
      const { data, status } = await apiService.get<GetAppSettingsResponse>(
        ApiEndpoints.SETTINGS,
      )

      if (isStatusSuccessful(status)) {
        dispatch(getUserConfigSettingsSuccess(data))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as unknown as AxiosError)
      dispatch(getUserConfigSettingsFailure(errorMessage))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function fetchUserSettingsSpec(
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(getUserSettingsSpec())

    try {
      const { data, status } = await apiService.get<GetAgreementsSpecResponse>(
        ApiEndpoints.SETTINGS_AGREEMENTS_SPEC,
      )

      if (isStatusSuccessful(status)) {
        dispatch(getUserSettingsSpecSuccess(data))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as unknown as AxiosError)
      dispatch(getUserSettingsSpecFailure(errorMessage))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function updateUserConfigSettingsAction(
  settings: any,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(updateUserConfigSettings())

    try {
      const { status, data } = await apiService.patch<UpdateSettingsDto>(
        ApiEndpoints.SETTINGS,
        settings,
      )

      if (isStatusSuccessful(status)) {
        dispatch(updateUserConfigSettingsSuccess(data))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as unknown as AxiosError)
      dispatch(updateUserConfigSettingsFailure(errorMessage))
      dispatch(addErrorNotification(error as unknown as AxiosError))
      onFailAction?.()
    }
  }
}

type ToggleAnalyticsReasonType =
  | 'none'
  | 'oauth-agreement'
  | 'google'
  | 'github'
  | 'sso'
  | 'user'

export function enableUserAnalyticsAction(
  reason: ToggleAnalyticsReasonType = 'none',
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const state = stateInit()
    const agreements = state?.user?.settings?.config?.agreements

    if (agreements && !agreements.analytics) {
      dispatch(
        updateUserConfigSettingsAction({
          agreements: { ...agreements, analytics: true },
          analyticsReason: reason,
        }),
      )
    }
  }
}
