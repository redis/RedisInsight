import axios, { AxiosError } from 'axios'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { remove } from 'lodash'

import successMessages from 'uiSrc/components/notifications/success-messages'
import { ApiEndpoints, SearchHistoryMode } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import {
  bufferToString,
  getApiErrorMessage,
  getUrl,
  isEqualBuffers,
  isStatusSuccessful,
  Maybe,
  Nullable,
} from 'uiSrc/utils'
import { DEFAULT_SEARCH_MATCH } from 'uiSrc/constants/api'
import { IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'
import ApiErrors from 'uiSrc/constants/apiErrors'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { SearchHistoryItem } from 'uiSrc/slices/interfaces/keys'
import { GetKeysWithDetailsResponse } from 'apiSrc/modules/browser/keys/dto'
import {
  CreateRedisearchIndexDto,
  IndexDeleteRequestBodyDto,
  ListRedisearchIndexesResponse,
} from 'apiSrc/modules/browser/redisearch/dto'

import { AppDispatch, RootState } from '../store'
import { RedisResponseBuffer, StateRedisearch } from '../interfaces'
import {
  addErrorNotification,
  addMessageNotification,
} from '../app/notifications'

export const initialState: StateRedisearch = {
  loading: false,
  error: '',
  search: '',
  isSearched: false,
  selectedIndex: null,
  data: {
    total: 0,
    scanned: 0,
    nextCursor: '0',
    keys: [],
    shardsMeta: {},
    previousResultCount: 0,
    lastRefreshTime: null,
  },
  list: {
    loading: undefined,
    error: '',
    data: [],
  },
  createIndex: {
    loading: false,
    error: '',
  },
  searchHistory: {
    data: null,
    loading: false,
  },
}

// A slice for recipes
const redisearchSlice = createSlice({
  name: 'redisearch',
  initialState,
  reducers: {
    setRedisearchInitialState: () => initialState,

    // load redisearch keys
    loadKeys: (state) => {
      state.loading = true
      state.error = ''
    },
    loadKeysSuccess: (
      state,
      {
        payload: [data, isSearched],
      }: PayloadAction<[GetKeysWithDetailsResponse, boolean]>,
    ) => {
      state.data = {
        ...state.data,
        ...data,
        nextCursor: `${data.cursor}`,
        previousResultCount: data.keys?.length,
      }
      state.loading = false
      state.isSearched = isSearched
      state.data.lastRefreshTime = Date.now()
    },
    loadKeysFailure: (state, { payload }: PayloadAction<Maybe<string>>) => {
      if (payload) {
        state.error = payload
      }
      state.loading = false
    },

    // load more redisearch keys
    loadMoreKeys: (state) => {
      state.loading = true
      state.error = ''
    },
    loadMoreKeysSuccess: (
      state,
      { payload }: PayloadAction<GetKeysWithDetailsResponse>,
    ) => {
      state.data.keys = payload.keys
      state.data.total = payload.total
      state.data.scanned = payload.scanned
      state.data.nextCursor = `${payload.cursor}`
      state.data.previousResultCount = payload.keys.length

      state.loading = false
    },
    loadMoreKeysFailure: (state, { payload }: PayloadAction<Maybe<string>>) => {
      if (payload) {
        state.error = payload
      }
      state.loading = false
    },

    // load list of indexes
    loadList: (state) => {
      state.list = {
        ...state.list,
        loading: true,
        error: '',
      }
    },
    loadListSuccess: (
      state,
      { payload }: PayloadAction<RedisResponseBuffer[]>,
    ) => {
      state.list = {
        ...state.list,
        loading: false,
        data: payload,
      }
    },
    loadListFailure: (state, { payload }) => {
      state.list = {
        ...state.list,
        loading: false,
        error: payload,
      }
    },
    createIndex: (state) => {
      state.createIndex = {
        ...state.createIndex,
        loading: true,
        error: '',
      }
    },
    createIndexSuccess: (state) => {
      state.createIndex = {
        ...state.createIndex,
        loading: false,
      }
    },
    createIndexFailure: (state, { payload }: PayloadAction<string>) => {
      state.createIndex = {
        ...state.createIndex,
        loading: false,
        error: payload,
      }
    },

    // create an index
    setSelectedIndex: (
      state,
      { payload }: PayloadAction<RedisResponseBuffer>,
    ) => {
      state.selectedIndex = payload
    },

    setLastBatchRedisearchKeys: (state, { payload }) => {
      const newKeys = state.data.keys
      newKeys.splice(-payload.length, payload.length, ...payload)
      state.data.keys = newKeys
    },

    setQueryRedisearch: (state, { payload }: PayloadAction<string>) => {
      state.search = payload
    },

    resetRedisearchKeysData: (state) => {
      state.data.total = 0
      state.data.scanned = 0
      state.data.keys.length = 0
    },

    deleteRedisearchKeyFromList: (state, { payload }) => {
      remove(state.data?.keys, (key) => isEqualBuffers(key.name, payload))

      state.data = {
        ...state.data,
        total: state.data.total - 1,
        scanned: state.data.scanned - 1,
      }
    },

    editRedisearchKeyFromList: (state, { payload }) => {
      const keys = state.data.keys.map((key) => {
        if (isEqualBuffers(key.name, payload?.key)) {
          key.name = payload?.newKey
          key.nameString = bufferToString(payload?.newKey)
        }
        return key
      })

      state.data = {
        ...state.data,
        keys,
      }
    },

    editRedisearchKeyTTLFromList: (
      state,
      { payload: [key, ttl] }: PayloadAction<[RedisResponseBuffer, number]>,
    ) => {
      const keys = state.data.keys.map((keyData) => {
        if (isEqualBuffers(keyData.name, key)) {
          keyData.ttl = ttl
        }
        return keyData
      })

      state.data = {
        ...state.data,
        keys,
      }
    },
    loadRediSearchHistory: (state) => {
      state.searchHistory.loading = true
    },
    loadRediSearchHistorySuccess: (
      state,
      { payload }: PayloadAction<SearchHistoryItem[]>,
    ) => {
      state.searchHistory.loading = false
      state.searchHistory.data = payload
    },
    loadRediSearchHistoryFailure: (state) => {
      state.searchHistory.loading = false
    },
    deleteRediSearchHistory: (state) => {
      state.searchHistory.loading = true
    },
    deleteRediSearchHistorySuccess: (
      state,
      { payload }: { payload: string[] },
    ) => {
      state.searchHistory.loading = false
      if (state.searchHistory.data) {
        remove(state.searchHistory.data, (item) => payload.includes(item.id))
      }
    },
    deleteRediSearchHistoryFailure: (state) => {
      state.searchHistory.loading = false
    },
  },
})

// Actions generated from the slice
export const {
  loadKeys,
  loadKeysSuccess,
  loadKeysFailure,
  loadMoreKeys,
  loadMoreKeysSuccess,
  loadMoreKeysFailure,
  loadList,
  loadListSuccess,
  loadListFailure,
  createIndex,
  createIndexSuccess,
  createIndexFailure,
  setRedisearchInitialState,
  setSelectedIndex,
  setLastBatchRedisearchKeys,
  setQueryRedisearch,
  resetRedisearchKeysData,
  deleteRedisearchKeyFromList,
  editRedisearchKeyFromList,
  editRedisearchKeyTTLFromList,
  loadRediSearchHistory,
  loadRediSearchHistorySuccess,
  loadRediSearchHistoryFailure,
  deleteRediSearchHistory,
  deleteRediSearchHistorySuccess,
  deleteRediSearchHistoryFailure,
} = redisearchSlice.actions

// Selectors
export const redisearchSelector = (state: RootState) => state.browser.redisearch
export const redisearchDataSelector = (state: RootState) =>
  state.browser.redisearch.data
export const redisearchListSelector = (state: RootState) =>
  state.browser.redisearch.list
export const createIndexStateSelector = (state: RootState) =>
  state.browser.redisearch.createIndex
export const redisearchHistorySelector = (state: RootState) =>
  state.browser.redisearch.searchHistory

// The reducer
export default redisearchSlice.reducer

// eslint-disable-next-line import/no-mutable-exports
export let controller: Nullable<AbortController> = null

// Asynchronous thunk action
export function fetchRedisearchKeysAction(
  cursor: string,
  count: number,
  telemetryProperties: { [key: string]: any } = {},
  onSuccess?: (value: GetKeysWithDetailsResponse) => void,
  onFailed?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadKeys())

    try {
      controller?.abort()
      controller = new AbortController()

      const state = stateInit()
      const { encoding } = state.app.info
      const { selectedIndex: index, search: query } = state.browser.redisearch
      const { data, status } =
        await apiService.post<GetKeysWithDetailsResponse>(
          getUrl(
            state.connections.instances.connectedInstance?.id,
            ApiEndpoints.REDISEARCH_SEARCH,
          ),
          {
            offset: +cursor,
            limit: count,
            query: query || DEFAULT_SEARCH_MATCH,
            index,
          },
          {
            params: { encoding },
            signal: controller.signal,
          },
        )

      controller = null

      if (isStatusSuccessful(status)) {
        dispatch(loadKeysSuccess([data, !!query]))

        if (query) {
          sendEventTelemetry({
            event: TelemetryEvent.SEARCH_KEYS_SEARCHED,
            eventData: {
              view: state.browser.keys?.viewType,
              databaseId: state.connections.instances?.connectedInstance?.id,
              scanCount: data.scanned,
              source: telemetryProperties.source ?? 'manual',
              ...telemetryProperties,
            },
          })
        }

        onSuccess?.(data)
      }
    } catch (_err) {
      if (!axios.isCancel(_err)) {
        const error = _err as AxiosError
        const errorMessage = getApiErrorMessage(error)
        dispatch(addErrorNotification(error))
        dispatch(loadKeysFailure(errorMessage))

        if (
          error?.response?.data?.message
            ?.toString()
            .endsWith(ApiErrors.RedisearchIndexNotFound)
        ) {
          dispatch(setRedisearchInitialState())
          dispatch(fetchRedisearchListAction())
        }
        onFailed?.()
      } else {
        dispatch(loadKeysFailure())
      }
    }
  }
}
// Asynchronous thunk action
export function fetchMoreRedisearchKeysAction(
  oldKeys: IKeyPropTypes[] = [],
  cursor: string,
  count: number,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadMoreKeys())

    try {
      controller?.abort()
      controller = new AbortController()

      const state = stateInit()
      const { encoding } = state.app.info
      const { selectedIndex: index, search: query } = state.browser.redisearch
      const { data, status } =
        await apiService.post<GetKeysWithDetailsResponse>(
          getUrl(
            state.connections.instances.connectedInstance?.id,
            ApiEndpoints.REDISEARCH_SEARCH,
          ),
          {
            offset: +cursor,
            limit: count,
            query: query || DEFAULT_SEARCH_MATCH,
            index,
          },
          {
            params: { encoding },
            signal: controller.signal,
          },
        )

      controller = null

      if (isStatusSuccessful(status)) {
        dispatch(
          loadMoreKeysSuccess({
            ...data,
            keys: oldKeys.concat(data.keys),
          }),
        )
      }
    } catch (_err) {
      if (!axios.isCancel(_err)) {
        const error = _err as AxiosError
        const errorMessage = getApiErrorMessage(error)
        dispatch(addErrorNotification(error))
        dispatch(loadMoreKeysFailure(errorMessage))
      } else {
        dispatch(loadMoreKeysFailure())
      }
    }
  }
}

export function fetchRedisearchListAction(
  onSuccess?: (value: RedisResponseBuffer[]) => void,
  onFailed?: () => void,
  showError = true,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadList())

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } =
        await apiService.get<ListRedisearchIndexesResponse>(
          getUrl(
            state.connections.instances.connectedInstance?.id,
            ApiEndpoints.REDISEARCH,
          ),
          {
            params: { encoding },
          },
        )

      if (isStatusSuccessful(status)) {
        dispatch(loadListSuccess(data.indexes))
        onSuccess?.(data.indexes)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      showError && dispatch(addErrorNotification(error))
      dispatch(loadListFailure(errorMessage))
      onFailed?.()
    }
  }
}
export function createRedisearchIndexAction(
  data: CreateRedisearchIndexDto,
  onSuccess?: (data: CreateRedisearchIndexDto) => void,
  onFailed?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(createIndex())

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { status } = await apiService.post<void>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.REDISEARCH,
        ),
        {
          ...data,
        },
        {
          params: { encoding },
        },
      )

      if (isStatusSuccessful(status)) {
        dispatch(createIndexSuccess())
        dispatch(addMessageNotification(successMessages.CREATE_INDEX()))
        dispatch(fetchRedisearchListAction())
        onSuccess?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(createIndexFailure(errorMessage))
      onFailed?.()
    }
  }
}

export function deleteRedisearchIndexAction(
  data: IndexDeleteRequestBodyDto,
  onSuccess?: (data: IndexDeleteRequestBodyDto) => void,
  onFailed?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { status } = await apiService.delete<void>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.REDISEARCH,
        ),
        {
          data,
          params: { encoding },
        },
      )

      if (isStatusSuccessful(status)) {
        dispatch(
          addMessageNotification(
            successMessages.DELETE_INDEX(bufferToString(data.index as string)),
          ),
        )
        dispatch(fetchRedisearchListAction())
        onSuccess?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      dispatch(addErrorNotification(error))
      onFailed?.()
    }
  }
}

export function fetchRedisearchHistoryAction(
  onSuccess?: () => void,
  onFailed?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadRediSearchHistory())

    try {
      const state = stateInit()
      const { data, status } = await apiService.get<SearchHistoryItem[]>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.HISTORY,
        ),
        {
          params: {
            mode: SearchHistoryMode.Redisearch,
          },
        },
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadRediSearchHistorySuccess(data))
        onSuccess?.()
      }
    } catch (_err) {
      dispatch(loadRediSearchHistoryFailure())
      onFailed?.()
    }
  }
}

export function deleteRedisearchHistoryAction(
  ids: string[],
  onSuccess?: () => void,
  onFailed?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(deleteRediSearchHistory())

    try {
      const state = stateInit()
      const { status } = await apiService.delete(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.HISTORY,
        ),
        {
          data: {
            ids,
          },
          params: {
            mode: SearchHistoryMode.Redisearch,
          },
        },
      )

      if (isStatusSuccessful(status)) {
        dispatch(deleteRediSearchHistorySuccess(ids))
        onSuccess?.()
      }
    } catch (_err) {
      dispatch(deleteRediSearchHistoryFailure())
      onFailed?.()
    }
  }
}

export function fetchRedisearchInfoAction(
  index: string,
  onSuccess?: (value: RedisResponseBuffer[]) => void,
  onFailed?: () => void,
) {
  return async (_: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { data, status } = await apiService.post(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.REDISEARCH_INFO,
        ),
        {
          index,
        },
      )

      if (isStatusSuccessful(status)) {
        onSuccess?.(data)
      }
    } catch (_err) {
      onFailed?.()
    }
  }
}
