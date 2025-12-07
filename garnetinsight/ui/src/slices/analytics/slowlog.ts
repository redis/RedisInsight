import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { ApiEndpoints, DurationUnits } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import { setSlowLogUnits } from 'uiSrc/slices/app/context'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { StateSlowLog } from 'uiSrc/slices/interfaces/analytics'
import { getApiErrorMessage, getUrl, isStatusSuccessful } from 'uiSrc/utils'
import { SlowLog, SlowLogConfig } from 'apiSrc/modules/slow-log/models'

import { AppDispatch, RootState } from '../store'

export const initialState: StateSlowLog = {
  loading: false,
  error: '',
  data: [],
  lastRefreshTime: null,
  config: null,
}

const slowLogSlice = createSlice({
  name: 'slowlog',
  initialState,
  reducers: {
    setSlowLogInitialState: () => initialState,
    getSlowLogs: (state) => {
      state.loading = true
    },
    getSlowLogsSuccess: (
      state,
      { payload: data }: PayloadAction<SlowLog[]>,
    ) => {
      state.loading = false
      state.data = data
      state.lastRefreshTime = Date.now()
    },
    getSlowLogsError: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    deleteSlowLogs: (state) => {
      state.loading = true
    },
    deleteSlowLogsSuccess: (state) => {
      state.loading = false
      state.data = []
    },
    deleteSlowLogsError: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    getSlowLogConfig: (state) => {
      state.loading = true
    },
    getSlowLogConfigSuccess: (
      state,
      { payload: data }: PayloadAction<SlowLogConfig>,
    ) => {
      state.loading = false
      state.config = data
    },
    getSlowLogConfigError: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
  },
})

export const slowLogSelector = (state: RootState) => state.analytics.slowlog
export const slowLogConfigSelector = (state: RootState) =>
  state.analytics.slowlog.config || {}

export const {
  setSlowLogInitialState,
  getSlowLogs,
  getSlowLogsSuccess,
  getSlowLogsError,
  deleteSlowLogs,
  deleteSlowLogsSuccess,
  deleteSlowLogsError,
  getSlowLogConfig,
  getSlowLogConfigSuccess,
  getSlowLogConfigError,
} = slowLogSlice.actions

// The reducer
export default slowLogSlice.reducer

// Asynchronous thunk action
export function fetchSlowLogsAction(
  instanceId: string,
  count: number,
  onSuccessAction?: (data: SlowLog[]) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(getSlowLogs())

      const { data, status } = await apiService.get<SlowLog[]>(
        getUrl(instanceId, ApiEndpoints.SLOW_LOGS),
        {
          params: { count },
        },
      )

      if (isStatusSuccessful(status)) {
        dispatch(getSlowLogsSuccess(data))

        onSuccessAction?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(getSlowLogsError(errorMessage))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function clearSlowLogAction(
  instanceId: string,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(deleteSlowLogs())

      const { status } = await apiService.delete<any>(
        getUrl(instanceId, ApiEndpoints.SLOW_LOGS),
      )

      if (isStatusSuccessful(status)) {
        dispatch(deleteSlowLogsSuccess())

        onSuccessAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(deleteSlowLogsError(errorMessage))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function getSlowLogConfigAction(
  instanceId: string,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(getSlowLogConfig())

      const { data, status } = await apiService.get<SlowLogConfig>(
        getUrl(instanceId, ApiEndpoints.SLOW_LOGS_CONFIG),
      )

      if (isStatusSuccessful(status)) {
        dispatch(getSlowLogConfigSuccess(data))

        onSuccessAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(getSlowLogConfigError(errorMessage))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function patchSlowLogConfigAction(
  instanceId: string,
  config: SlowLogConfig,
  durationUnit: DurationUnits,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(getSlowLogConfig())

      const { data, status } = await apiService.patch<SlowLogConfig>(
        getUrl(instanceId, ApiEndpoints.SLOW_LOGS_CONFIG),
        config,
      )

      if (isStatusSuccessful(status)) {
        dispatch(getSlowLogConfigSuccess(data))
        dispatch(setSlowLogUnits(durationUnit))

        onSuccessAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(getSlowLogConfigError(errorMessage))
      onFailAction?.()
    }
  }
}
