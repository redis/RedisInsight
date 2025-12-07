import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosResponseHeaders } from 'axios'
import { ApiEndpoints, KeyTypes } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import {
  getApiErrorMessage,
  getUrl,
  isStatusSuccessful,
  Maybe,
} from 'uiSrc/utils'
import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { IFetchKeyArgs } from 'uiSrc/constants/prop-types/keys'

import { refreshKeyInfoAction } from './keys'
import { addErrorNotification } from '../app/notifications'
import { AppDispatch, RootState } from '../store'
import { StringState } from '../interfaces/string'
import { RedisResponseBuffer } from '../interfaces'

export const initialState: StringState = {
  loading: false,
  error: '',
  data: {
    key: '',
    value: null,
  },
}

// A slice for recipes
const stringSlice = createSlice({
  name: 'string',
  initialState,
  reducers: {
    // load String value
    getString: (
      state,
      { payload: resetData = true }: PayloadAction<Maybe<boolean>>,
    ) => {
      state.loading = true
      state.error = ''

      if (resetData) {
        state.data = initialState.data
      }
    },
    getStringSuccess: (state, { payload }) => {
      state.data.key = payload.keyName
      state.data.value = payload.value
      state.loading = false
    },
    getStringFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    downloadString: (state) => {
      state.loading = true
      state.error = ''
    },
    downloadStringSuccess: (state) => {
      state.loading = false
      state.error = ''
    },
    downloadStringFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    updateValue: (state) => {
      state.loading = true
      state.error = ''
    },
    updateValueSuccess: (state, { payload }) => {
      state.loading = false
      state.data.value = payload
    },
    updateValueFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    resetStringValue: (state) => {
      state.data.key = ''
      state.data.value = null
    },
    setIsStringCompressed: (state, { payload }: PayloadAction<boolean>) => {
      state.isCompressed = payload
    },
  },
})

// Actions generated from the slice
export const {
  getString,
  getStringSuccess,
  getStringFailure,
  downloadString,
  downloadStringSuccess,
  downloadStringFailure,
  updateValue,
  updateValueSuccess,
  updateValueFailure,
  resetStringValue,
  setIsStringCompressed,
} = stringSlice.actions

// A selector
export const stringSelector = (state: RootState) => state.browser.string
export const stringDataSelector = (state: RootState) =>
  state.browser.string?.data

// The reducer
export default stringSlice.reducer

// Asynchronous thunk action
export function fetchString(
  key: RedisResponseBuffer,
  args: IFetchKeyArgs = {},
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const { resetData, end: endString } = args
    dispatch(getString(resetData))

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.post(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.STRING_VALUE,
        ),
        {
          keyName: key,
          end: endString,
        },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(getStringSuccess(data))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(getStringFailure(errorMessage))
    }
  }
}

// Asynchronous thunk action
export function fetchDownloadStringValue(
  key: RedisResponseBuffer,
  onSuccessAction?: (data: string, headers: AxiosResponseHeaders) => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(downloadString())

    try {
      const state = stateInit()
      const { data, status, headers } = await apiService.post(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          `${ApiEndpoints.STRING_VALUE_DOWNLOAD}`,
        ),
        {
          keyName: key,
        },
        { responseType: 'arraybuffer' },
      )

      if (isStatusSuccessful(status)) {
        dispatch(downloadStringSuccess())
        onSuccessAction?.(data, headers)
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(downloadStringFailure(errorMessage))
    }
  }
}

// Asynchronous thunk action
export function updateStringValueAction(
  key: RedisResponseBuffer,
  value: RedisResponseBuffer,
  onSuccess?: (value: RedisResponseBuffer) => void,
  onFailed?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(updateValue())

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { status } = await apiService.put(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.STRING,
        ),
        {
          keyName: key,
          value,
        },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        sendEventTelemetry({
          event: getBasedOnViewTypeEvent(
            state.browser.keys?.viewType,
            TelemetryEvent.BROWSER_KEY_VALUE_EDITED,
            TelemetryEvent.TREE_VIEW_KEY_VALUE_EDITED,
          ),
          eventData: {
            databaseId: state.connections.instances?.connectedInstance?.id,
            keyType: KeyTypes.String,
          },
        })
        dispatch(updateValueSuccess(value))
        dispatch<any>(refreshKeyInfoAction(key))
        onSuccess?.(value)
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(updateValueFailure(errorMessage))
      onFailed?.()
    }
  }
}
