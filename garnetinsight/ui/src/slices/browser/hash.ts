import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { cloneDeep, remove, isNull } from 'lodash'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints, KeyTypes } from 'uiSrc/constants'
import {
  bufferToString,
  getApiErrorMessage,
  getUrl,
  isEqualBuffers,
  isStatusSuccessful,
  Maybe,
} from 'uiSrc/utils'
import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import successMessages from 'uiSrc/components/notifications/success-messages'
import {
  GetHashFieldsResponse,
  AddFieldsToHashDto,
  UpdateHashFieldsTtlDto,
} from 'apiSrc/modules/browser/hash/dto'
import {
  deleteKeyFromList,
  deleteSelectedKeySuccess,
  fetchKeyInfo,
  refreshKeyInfoAction,
  updateSelectedKeyRefreshTime,
} from './keys'
import { AppDispatch, RootState } from '../store'
import { HashField, RedisResponseBuffer, StateHash } from '../interfaces'
import {
  addErrorNotification,
  addMessageNotification,
} from '../app/notifications'

export const initialState: StateHash = {
  loading: false,
  error: '',
  data: {
    total: 0,
    key: undefined,
    keyName: '',
    fields: [],
    nextCursor: 0,
    match: '*',
  },
  updateValue: {
    loading: false,
    error: '',
  },
}

// A slice for recipes
const hashSlice = createSlice({
  name: 'hash',
  initialState,
  reducers: {
    setHashInitialState: () => initialState,

    setHashFields: (state, { payload }: PayloadAction<HashField[]>) => {
      state.data.fields = payload
    },

    // load Hash fields
    loadHashFields: (
      state,
      {
        payload: [match = '', resetData = true],
      }: PayloadAction<[string, Maybe<boolean>]>,
    ) => {
      state.loading = true
      state.error = ''

      if (resetData) {
        state.data = initialState.data
      }

      state.data = {
        ...state.data,
        match: match || '*',
      }
    },
    loadHashFieldsSuccess: (
      state,
      { payload }: PayloadAction<GetHashFieldsResponse>,
    ) => {
      state.data = {
        ...state.data,
        ...payload,
      }
      state.data.key = payload.keyName
      state.loading = false
    },
    loadHashFieldsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    // load more Hash fields for infinity scroll
    loadMoreHashFields: (state) => {
      state.loading = true
      state.error = ''
    },
    loadMoreHashFieldsSuccess: (
      state,
      { payload: { fields, ...rest } }: PayloadAction<GetHashFieldsResponse>,
    ) => {
      state.loading = false
      state.data = {
        ...state.data,
        ...rest,
        fields: state.data?.fields?.concat(fields),
      }
    },
    loadMoreHashFieldsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },

    // Update Hash Value
    updateValue: (state) => {
      state.updateValue = {
        ...state.updateValue,
        loading: true,
        error: '',
      }
    },
    updateValueSuccess: (state) => {
      state.updateValue = {
        ...state.updateValue,
        loading: false,
      }
    },
    updateValueFailure: (state, { payload }) => {
      state.updateValue = {
        ...state.updateValue,
        loading: false,
        error: payload,
      }
    },
    resetUpdateValue: (state) => {
      state.updateValue = cloneDeep(initialState.updateValue)
    },

    // delete Hash fields
    removeHashFields: (state) => {
      state.loading = true
      state.error = ''
    },
    removeHashFieldsSuccess: (state) => {
      state.loading = false
    },
    removeHashFieldsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    removeFieldsFromList: (
      state,
      { payload }: { payload: RedisResponseBuffer[] },
    ) => {
      remove(
        state.data?.fields,
        ({ field }) =>
          payload.findIndex((item) => isEqualBuffers(item, field)) > -1,
      )

      state.data = {
        ...state.data,
        total: state.data.total - 1,
      }
    },
    updateFieldsInList: (state, { payload }: { payload: HashField[] }) => {
      const newFieldsState = state.data.fields.map((listItem) => {
        const index = payload.findIndex((item) =>
          isEqualBuffers(item.field, listItem.field),
        )
        if (index > -1) {
          return {
            ...listItem,
            ...payload[index],
          }
        }
        return listItem
      })

      state.data = {
        ...state.data,
        fields: newFieldsState,
      }
    },
  },
})

// Actions generated from the slice
export const {
  setHashInitialState,
  loadHashFields,
  loadHashFieldsSuccess,
  loadHashFieldsFailure,
  loadMoreHashFields,
  loadMoreHashFieldsSuccess,
  loadMoreHashFieldsFailure,
  removeHashFields,
  removeHashFieldsSuccess,
  removeHashFieldsFailure,
  removeFieldsFromList,
  updateValue,
  updateValueSuccess,
  updateValueFailure,
  resetUpdateValue,
  updateFieldsInList,
  setHashFields,
} = hashSlice.actions

// Selectors
export const hashSelector = (state: RootState) => state.browser.hash
export const hashDataSelector = (state: RootState) => state.browser.hash?.data
export const updateHashValueStateSelector = (state: RootState) =>
  state.browser.hash.updateValue

// The reducer
export default hashSlice.reducer

// Asynchronous thunk actions
export function fetchHashFields(
  key: RedisResponseBuffer,
  cursor: number,
  count: number,
  match: string,
  resetData: boolean = true,
  onSuccess?: (data: GetHashFieldsResponse) => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadHashFields([isNull(match) ? '*' : match, resetData]))

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.post<GetHashFieldsResponse>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.HASH_GET_FIELDS,
        ),
        {
          keyName: key,
          cursor,
          count,
          match,
        },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadHashFieldsSuccess(data))
        dispatch(updateSelectedKeyRefreshTime(Date.now()))
        onSuccess?.(data)
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(loadHashFieldsFailure(errorMessage))
    }
  }
}

// Asynchronous thunk actions
export function refreshHashFieldsAction(
  key: RedisResponseBuffer,
  resetData?: boolean,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const state = stateInit()
    const { match } = state.browser.hash.data
    const { encoding } = state.app.info
    dispatch(loadHashFields([match || '*', resetData]))

    try {
      const { data, status } = await apiService.post<GetHashFieldsResponse>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.HASH_GET_FIELDS,
        ),
        {
          keyName: key,
          cursor: 0,
          count: SCAN_COUNT_DEFAULT,
          match,
        },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadHashFieldsSuccess(data))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(loadHashFieldsFailure(errorMessage))
    }
  }
}

// Asynchronous thunk actions
export function fetchMoreHashFields(
  key: RedisResponseBuffer,
  cursor: number,
  count: number,
  match: string,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadMoreHashFields())

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.post(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.HASH_GET_FIELDS,
        ),
        {
          keyName: key,
          cursor,
          count,
          match: isNull(match) ? '*' : match,
        },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadMoreHashFieldsSuccess(data))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(loadMoreHashFieldsFailure(errorMessage))
    }
  }
}

// Asynchronous thunk actions
export function deleteHashFields(
  key: RedisResponseBuffer,
  fields: RedisResponseBuffer[],
  onSuccessAction?: (newTotal?: number) => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(removeHashFields())
    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { status, data } = await apiService.delete(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.HASH_FIELDS,
        ),
        {
          data: {
            keyName: key,
            fields,
          },
          params: { encoding },
        },
      )
      const newTotalValue = state.browser.hash.data.total - data.affected
      if (isStatusSuccessful(status)) {
        onSuccessAction?.(newTotalValue)
        dispatch(removeHashFieldsSuccess())
        dispatch(removeFieldsFromList(fields))
        if (newTotalValue > 0) {
          dispatch<any>(refreshKeyInfoAction(key))
          dispatch(
            addMessageNotification(
              successMessages.REMOVED_KEY_VALUE(
                key,
                fields.map((field) => bufferToString(field)).join(''),
                'Field',
              ),
            ),
          )
        } else {
          dispatch(deleteSelectedKeySuccess())
          dispatch(deleteKeyFromList(key))
          dispatch(addMessageNotification(successMessages.DELETED_KEY(key)))
        }
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(removeHashFieldsFailure(errorMessage))
    }
  }
}

// Asynchronous thunk action
export function addHashFieldsAction(
  data: AddFieldsToHashDto,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(updateValue())
    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { status } = await apiService.put(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.HASH,
        ),
        data,
        { params: { encoding } },
      )
      if (isStatusSuccessful(status)) {
        if (onSuccessAction) {
          onSuccessAction()
        }
        dispatch(updateValueSuccess())
        dispatch<any>(fetchKeyInfo(data.keyName))
      }
    } catch (error) {
      if (onFailAction) {
        onFailAction()
      }
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(updateValueFailure(errorMessage))
    }
  }
}

// Asynchronous thunk action
export function updateHashFieldsAction(
  data: AddFieldsToHashDto,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(updateValue())
    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { status } = await apiService.put(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.HASH,
        ),
        data,
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
            keyType: KeyTypes.Hash,
          },
        })
        dispatch(updateValueSuccess())
        dispatch(updateFieldsInList(data.fields))
        dispatch<any>(refreshKeyInfoAction(data.keyName))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(updateValueFailure(errorMessage))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function updateHashTTLAction(
  data: UpdateHashFieldsTtlDto,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(updateValue())
    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { status } = await apiService.patch(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.HASH_TTL,
        ),
        data,
        { params: { encoding } },
      )
      if (isStatusSuccessful(status)) {
        sendEventTelemetry({
          event: getBasedOnViewTypeEvent(
            state.browser.keys?.viewType,
            TelemetryEvent.BROWSER_FIELD_TTL_EDITED,
            TelemetryEvent.TREE_VIEW_FIELD_TTL_EDITED,
          ),
          eventData: {
            databaseId: state.connections.instances?.connectedInstance?.id,
          },
        })
        onSuccessAction?.()
        dispatch(updateValueSuccess())

        const key = data.keyName as RedisResponseBuffer
        const isLastFieldAffected =
          state.browser.hash.data.total - data.fields.length === 0
        const isSetToZero =
          data.fields.reduce((prev, current) => prev + current.expire, 0) === 0

        if (isLastFieldAffected && isSetToZero) {
          dispatch(deleteSelectedKeySuccess())
          dispatch(deleteKeyFromList(key))
          dispatch(addMessageNotification(successMessages.DELETED_KEY(key)))
          return
        }

        if (isSetToZero) {
          dispatch(
            removeFieldsFromList(data.fields.map(({ field }) => field) as any),
          )
          return
        }

        dispatch(updateFieldsInList(data.fields as any))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(updateValueFailure(errorMessage))
      onFailAction?.()
    }
  }
}
