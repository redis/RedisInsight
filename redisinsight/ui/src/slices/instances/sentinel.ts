import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { cloneDeep } from 'lodash'
import { AxiosError } from 'axios'

import {
  getApiErrorMessage,
  getApiErrorsFromBulkOperation,
  isStatusSuccessful,
  parseAddedMastersSentinel,
  parseMastersSentinel,
} from 'uiSrc/utils'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { ApiEncryptionErrors } from 'uiSrc/constants/apiErrors'

import { SentinelMaster } from 'apiSrc/modules/redis-sentinel/models/sentinel-master'
import { CreateSentinelDatabasesDto } from 'apiSrc/modules/redis-sentinel/dto/create.sentinel.databases.dto'
import { CreateSentinelDatabaseResponse } from 'apiSrc/modules/redis-sentinel/dto/create.sentinel.database.response'
import {
  AddRedisDatabaseStatus,
  InitialStateSentinel,
  Instance,
  LoadedSentinel,
  ModifiedSentinelMaster,
} from '../interfaces'
import { AppDispatch, RootState } from '../store'
import { addErrorNotification } from '../app/notifications'
import type { ActionStatus } from 'src/common/models'

export const initialState: InitialStateSentinel = {
  loading: false,
  error: '',
  instance: null,
  data: [],
  statuses: [],
  loaded: {
    [LoadedSentinel.Masters]: false,
  },
}

export const initialStateSentinelStatus: CreateSentinelDatabaseResponse = {
  name: '',
  status: AddRedisDatabaseStatus.Success as unknown as ActionStatus,
  message: '',
}

// A slice for recipes
const sentinelSlice = createSlice({
  name: 'sentinel',
  initialState,
  reducers: {
    setInstanceSentinel: (state, { payload }: { payload: Instance }) => {
      state.instance = payload
    },
    // load redis sentinel subscriptions
    loadMastersSentinel: (state) => {
      state.loading = true
      state.error = ''
    },
    loadMastersSentinelSuccess: (
      state,
      { payload }: { payload: SentinelMaster[] },
    ) => {
      state.loading = false
      state.loaded[LoadedSentinel.Masters] = true
      state.data = parseMastersSentinel(payload)
    },
    loadMastersSentinelFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },

    updateMastersSentinel: (
      state,
      { payload }: { payload: ModifiedSentinelMaster[] },
    ) => {
      state.data = payload
    },

    // add redis master sentinel
    createMastersSentinel: (state) => {
      state.loading = true
      state.error = ''
    },
    createMastersSentinelSuccess: (
      state,
      { payload }: { payload: CreateSentinelDatabasesDto[] },
    ) => {
      state.loading = false

      state.loaded[LoadedSentinel.MastersAdded] = true

      state.statuses = payload
      state.data = parseAddedMastersSentinel(state.data, payload)
    },
    createMastersSentinelFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },

    // reset data for sentinel slice
    resetDataSentinel: () => cloneDeep(initialState),

    // reset loaded field by LoadedSentinel for sentinel slice
    resetLoadedSentinel: (
      state,
      { payload }: PayloadAction<LoadedSentinel>,
    ) => {
      state.loaded[payload] = false
    },
  },
})

// Actions generated from the slice
export const {
  setInstanceSentinel,
  loadMastersSentinel,
  loadMastersSentinelSuccess,
  loadMastersSentinelFailure,
  updateMastersSentinel,
  createMastersSentinel,
  createMastersSentinelSuccess,
  createMastersSentinelFailure,
  resetDataSentinel,
  resetLoadedSentinel,
} = sentinelSlice.actions

// A selector
export const sentinelSelector = (state: RootState) => state.connections.sentinel

// The reducer
export default sentinelSlice.reducer

// Asynchronous thunk action
export function fetchMastersSentinelAction(
  payload: Instance,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(loadMastersSentinel())

    try {
      const { status, data } = await apiService.post<SentinelMaster[]>(
        `${ApiEndpoints.SENTINEL_GET_DATABASES}`,
        payload,
      )

      if (isStatusSuccessful(status)) {
        dispatch(setInstanceSentinel(payload))
        dispatch(loadMastersSentinelSuccess(data))

        onSuccessAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(loadMastersSentinelFailure(errorMessage))
      dispatch(addErrorNotification(error))

      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function createMastersSentinelAction(
  payload: {
    alias: string
    name: string
    username?: string
    password?: string
    db?: number
  }[],
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(createMastersSentinel())

    const state = stateInit()
    try {
      const { instance } = state.connections.sentinel
      const { data, status } = await apiService.post<
        CreateSentinelDatabaseResponse[]
      >(`${ApiEndpoints.SENTINEL_DATABASES}`, {
        ...instance,
        masters: payload,
      })

      if (isStatusSuccessful(status)) {
        const encryptionErrors = getApiErrorsFromBulkOperation(
          data,
          ...ApiEncryptionErrors,
        )
        if (encryptionErrors.length) {
          dispatch(addErrorNotification(encryptionErrors[0]))
        }
        dispatch(createMastersSentinelSuccess(data))

        onSuccessAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(createMastersSentinelFailure(errorMessage))
      dispatch(addErrorNotification(error))

      onFailAction?.()
    }
  }
}
