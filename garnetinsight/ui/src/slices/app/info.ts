import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { getApiErrorMessage, isStatusSuccessful } from 'uiSrc/utils'
import { GetServerInfoResponse } from 'apiSrc/modules/server/dto/server.dto'

import { AppDispatch, RootState } from '../store'
import { RedisResponseEncoding, StateAppInfo } from '../interfaces'

export const initialState: StateAppInfo = {
  loading: true,
  error: '',
  server: null,
  encoding: RedisResponseEncoding.Buffer,
  electron: {
    isUpdateAvailable: null,
    updateDownloadedVersion: '',
    isReleaseNotesViewed: null,
  },
  isShortcutsFlyoutOpen: false,
}

// A slice for recipes
const appInfoSlice = createSlice({
  name: 'appInfo',
  initialState,
  reducers: {
    setServerInfoInitialState: () => initialState,
    setElectronInfo: (state, { payload }) => {
      state.electron.isUpdateAvailable = payload.isUpdateAvailable
      state.electron.updateDownloadedVersion = payload.updateDownloadedVersion
    },
    setReleaseNotesViewed: (state, { payload }) => {
      state.electron.isReleaseNotesViewed = payload
    },
    getServerInfo: (state) => {
      state.loading = true
    },
    getServerInfoSuccess: (state, { payload }) => {
      state.loading = false
      state.server = payload
    },
    getServerInfoFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    setShortcutsFlyoutState: (state, { payload }) => {
      state.isShortcutsFlyoutOpen = payload
    },
    setEncoding: (state, { payload }: PayloadAction<RedisResponseEncoding>) => {
      state.encoding = payload
    },
    setServerLoaded: (state) => {
      state.loading = false
    },
  },
})

// Actions generated from the slice
export const {
  setElectronInfo,
  setReleaseNotesViewed,
  getServerInfo,
  getServerInfoSuccess,
  getServerInfoFailure,
  setShortcutsFlyoutState,
  setEncoding,
  setServerLoaded,
} = appInfoSlice.actions

// A selector
export const appInfoSelector = (state: RootState) => state.app.info
export const appServerInfoSelector = (state: RootState) => state.app.info.server
export const appElectronInfoSelector = (state: RootState) =>
  state.app.info.electron

// The reducer
export default appInfoSlice.reducer

// Asynchronous thunk action
export function fetchServerInfo(
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(getServerInfo())

    try {
      const { data, status } = await apiService.get<GetServerInfoResponse>(
        ApiEndpoints.INFO,
      )

      if (isStatusSuccessful(status)) {
        dispatch(getServerInfoSuccess(data))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(getServerInfoFailure(errorMessage))
      onFailAction?.()
    }
  }
}
