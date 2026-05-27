import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'

import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import {
  DEFAULT_ERROR_MESSAGE,
  getApiErrorMessage,
  getUrl,
  isStatusSuccessful,
  stringToBuffer,
} from 'uiSrc/utils'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import {
  deleteKeyFromList,
  deleteSelectedKeySuccess,
  refreshKeyInfoAction,
  updateSelectedKeyRefreshTime,
} from './keys'
import { AppDispatch, RootState } from '../store'
import { RedisResponseBuffer } from '../interfaces'
import {
  AddArrayElementsData,
  AddArrayElementsState,
  ArrayData,
  CreateArrayWithExpireDto,
  FetchArrayElementsParams,
  FetchMoreArrayElementsParams,
  GetArrayElementsResponse,
  InitialStateArray,
} from '../interfaces/array'
import {
  addErrorNotification,
  addMessageNotification,
  IAddInstanceErrorPayload,
} from '../app/notifications'

const ARRAY_COUNT_DEFAULT = 500

export const initialState: InitialStateArray = {
  loading: false,
  error: '',
  data: {
    total: 0,
    logicalLength: 0,
    keyName: '',
    nextCursor: undefined,
    elements: [],
  },
  adding: {
    loading: false,
    error: '',
  },
}

const arraySlice = createSlice({
  name: 'array',
  initialState,
  reducers: {
    loadArrayElements: (
      state,
      { payload: resetData = true }: PayloadAction<boolean | undefined>,
    ) => {
      state.loading = true
      state.error = ''

      if (resetData) {
        state.data = initialState.data
      }
    },
    loadArrayElementsSuccess: (
      state,
      { payload }: PayloadAction<ArrayData>,
    ) => {
      state.data = {
        ...state.data,
        ...payload,
      }
      state.loading = false
    },
    loadArrayElementsFailure: (state, { payload }: PayloadAction<string>) => {
      state.loading = false
      state.error = payload
    },

    loadMoreArrayElements: (state) => {
      state.loading = true
      state.error = ''
    },
    loadMoreArrayElementsSuccess: (
      state,
      { payload: { elements, nextCursor, ...rest } }: PayloadAction<ArrayData>,
    ) => {
      state.loading = false
      state.data = {
        ...state.data,
        ...rest,
        nextCursor,
        elements: (state.data?.elements ?? []).concat(elements),
      }
    },
    loadMoreArrayElementsFailure: (
      state,
      { payload }: PayloadAction<string>,
    ) => {
      state.loading = false
      state.error = payload
    },

    removeArrayElements: (state) => {
      state.loading = true
      state.error = ''
    },
    removeArrayElementsSuccess: (state) => {
      state.loading = false
    },
    removeArrayElementsFailure: (state, { payload }: PayloadAction<string>) => {
      state.loading = false
      state.error = payload
    },
    removeIndicesFromList: (
      state,
      { payload: indices }: PayloadAction<number[]>,
    ) => {
      state.data.elements = state.data.elements.filter(
        (el) => !indices.includes(el.index),
      )
      state.data.total -= indices.length
    },

    addElements: (state) => {
      state.adding = {
        ...state.adding,
        loading: true,
        error: '',
      }
    },
    addElementsSuccess: (state) => {
      state.adding = {
        ...state.adding,
        loading: false,
      }
    },
    addElementsFailure: (state, { payload }: PayloadAction<string>) => {
      state.adding = {
        ...state.adding,
        loading: false,
        error: payload,
      }
    },
  },
})

export const {
  loadArrayElements,
  loadArrayElementsSuccess,
  loadArrayElementsFailure,
  loadMoreArrayElements,
  loadMoreArrayElementsSuccess,
  loadMoreArrayElementsFailure,
  removeArrayElements,
  removeArrayElementsSuccess,
  removeArrayElementsFailure,
  removeIndicesFromList,
  addElements,
  addElementsSuccess,
  addElementsFailure,
} = arraySlice.actions

export const arraySelector = (state: RootState) => state.browser.array
export const arrayDataSelector = (state: RootState) => state.browser.array?.data
export const addArrayElementsStateSelector = (
  state: RootState,
): AddArrayElementsState => state.browser.array?.adding

export default arraySlice.reducer

export function fetchArrayElements({
  key,
  count = ARRAY_COUNT_DEFAULT,
  resetData,
}: FetchArrayElementsParams) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadArrayElements(resetData))

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.post<GetArrayElementsResponse>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.ARRAY_GET_ELEMENTS,
        ),
        {
          keyName: key,
          cursor: 0,
          count,
        },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadArrayElementsSuccess(data))
        dispatch(updateSelectedKeyRefreshTime(Date.now()))
      } else {
        dispatch(loadArrayElementsFailure(DEFAULT_ERROR_MESSAGE))
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(loadArrayElementsFailure(errorMessage))
    }
  }
}

export function fetchMoreArrayElements({
  key,
  cursor,
  count = ARRAY_COUNT_DEFAULT,
}: FetchMoreArrayElementsParams) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadMoreArrayElements())

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.post<GetArrayElementsResponse>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.ARRAY_GET_ELEMENTS,
        ),
        {
          keyName: key,
          cursor,
          count,
        },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadMoreArrayElementsSuccess(data))
      } else {
        dispatch(loadMoreArrayElementsFailure(DEFAULT_ERROR_MESSAGE))
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(loadMoreArrayElementsFailure(errorMessage))
    }
  }
}

export function deleteArrayElements(
  key: RedisResponseBuffer,
  indices: number[],
  onSuccessAction?: (newTotal: number) => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(removeArrayElements())

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.delete(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.ARRAY_ELEMENTS,
        ),
        {
          data: {
            keyName: key,
            indices,
          },
          params: { encoding },
        },
      )

      if (isStatusSuccessful(status)) {
        const newTotalValue = state.browser.array.data.total - data.affected

        sendEventTelemetry({
          event: TelemetryEvent.BROWSER_KEY_VALUE_REMOVED,
          eventData: {
            databaseId: state.connections.instances.connectedInstance?.id,
            keyType: 'array',
          },
        })

        onSuccessAction?.(newTotalValue)
        dispatch(removeArrayElementsSuccess())
        dispatch(removeIndicesFromList(indices))

        if (newTotalValue > 0) {
          dispatch(refreshKeyInfoAction(key))
          dispatch(
            addMessageNotification(
              successMessages.REMOVED_KEY_VALUE(
                key,
                stringToBuffer(indices.join(', ')),
                'Element',
              ),
            ),
          )
        } else {
          dispatch(deleteSelectedKeySuccess())
          dispatch(deleteKeyFromList(key))
          dispatch(addMessageNotification(successMessages.DELETED_KEY(key)))
        }
      } else {
        dispatch(removeArrayElementsFailure(DEFAULT_ERROR_MESSAGE))
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(removeArrayElementsFailure(errorMessage))
    }
  }
}

export function addArrayElements(
  data: AddArrayElementsData,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(addElements())
    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { status } = await apiService.put(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.ARRAY,
        ),
        {
          keyName: data.keyName,
          elements: data.elements,
        },
        { params: { encoding } },
      )
      if (isStatusSuccessful(status)) {
        onSuccessAction?.()
        dispatch(addElementsSuccess())
        dispatch<any>(fetchArrayElements({ key: data.keyName }))
        dispatch(refreshKeyInfoAction(data.keyName))
      } else {
        dispatch(addElementsFailure(DEFAULT_ERROR_MESSAGE))
        onFailAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(addElementsFailure(errorMessage))
      onFailAction?.()
    }
  }
}

export function createArrayKey(
  data: CreateArrayWithExpireDto,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(addElements())
    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { status } = await apiService.post(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.ARRAY,
        ),
        data,
        { params: { encoding } },
      )
      if (isStatusSuccessful(status)) {
        onSuccessAction?.()
        dispatch(addElementsSuccess())
        sendEventTelemetry({
          event: TelemetryEvent.BROWSER_KEY_ADDED,
          eventData: {
            databaseId: state.connections.instances.connectedInstance?.id,
            keyType: 'array',
          },
        })
      } else {
        dispatch(addElementsFailure(DEFAULT_ERROR_MESSAGE))
        onFailAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(addElementsFailure(errorMessage))
      onFailAction?.()
    }
  }
}
