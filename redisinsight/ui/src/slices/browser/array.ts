import { cloneDeep, isNull } from 'lodash'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'

import { apiService } from 'uiSrc/services'
import { ApiEndpoints, KeyTypes } from 'uiSrc/constants'
import {
  getApiErrorMessage,
  getUrl,
  isStatusSuccessful,
  Maybe,
  stringToBuffer,
} from 'uiSrc/utils'
import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import successMessages from 'uiSrc/components/notifications/success-messages'
import {
  DeleteArrayElementsResponse,
  SetArrayElementDto,
  SetArrayElementResponse,
} from 'apiSrc/modules/browser/array/dto'
import {
  addErrorNotification,
  addMessageNotification,
  IAddInstanceErrorPayload,
} from '../app/notifications'
import {
  deleteKeyFromList,
  deleteSelectedKeySuccess,
  fetchKeyInfo,
  refreshKeyInfoAction,
  updateSelectedKeyRefreshTime,
} from './keys'
import { AppDispatch, RootState } from '../store'
import { RedisResponseBuffer } from '../interfaces'
import {
  AddArrayElementsData,
  ArrayData,
  GetArrayElementsResponse,
  StateArray,
} from '../interfaces/array'

export const initialState: StateArray = {
  loading: false,
  error: '',
  data: {
    total: 0,
    key: '',
    keyName: '',
    logicalLength: '0',
    nextIndex: undefined,
    isPaginationSupported: true,
    elements: [],
    searchedIndex: null,
    match: '',
  },
  updateValue: {
    loading: false,
    error: '',
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
    setArrayInitialState: () => initialState,
    loadArrayElements: (
      state,
      { payload: resetData = true }: PayloadAction<Maybe<boolean>>,
    ) => {
      state.loading = true
      state.error = ''

      if (resetData) {
        state.data = cloneDeep(initialState.data)
      }
    },
    loadArrayElementsSuccess: (
      state,
      { payload }: PayloadAction<ArrayData>,
    ) => {
      state.data = {
        ...state.data,
        ...payload,
        key: payload.keyName,
      }
      state.loading = false
    },
    loadArrayElementsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    loadMoreArrayElements: (state) => {
      state.loading = true
      state.error = ''
      state.data.searchedIndex = initialState.data.searchedIndex
      state.data.match = initialState.data.match
    },
    loadMoreArrayElementsSuccess: (
      state,
      { payload: { elements, ...rest } }: PayloadAction<ArrayData>,
    ) => {
      state.loading = false
      state.data = {
        ...state.data,
        ...rest,
        elements: state.data.elements.concat(elements),
      }
    },
    loadMoreArrayElementsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    loadSearchingArrayElement: (
      state,
      { payload }: PayloadAction<string | null>,
    ) => {
      state.loading = true
      state.error = ''
      state.data = {
        ...state.data,
        elements: [],
        searchedIndex: payload,
        match: '',
      }
    },
    loadSearchingArrayElementSuccess: (
      state,
      { payload }: PayloadAction<ArrayData>,
    ) => {
      state.loading = false
      state.data = {
        ...state.data,
        ...payload,
        key: payload.keyName,
      }
    },
    loadSearchingArrayElementFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
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
    updateElementInArray: (
      state,
      { payload }: PayloadAction<SetArrayElementDto>,
    ) => {
      const element = state.data.elements.find(
        (item) => item.index === payload.index,
      )
      if (element) {
        element.value = payload.value as RedisResponseBuffer
      }
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
    addElementsFailure: (state, { payload }) => {
      state.adding = {
        ...state.adding,
        loading: false,
        error: payload,
      }
    },
    removeArrayElements: (state) => {
      state.loading = true
      state.error = ''
    },
    removeArrayElementsSuccess: (
      state,
      {
        payload,
      }: PayloadAction<{
        indexes: string[]
        affected: number
      }>,
    ) => {
      state.loading = false
      const { indexes, affected } = payload
      state.data.elements = state.data.elements.filter(
        (element) => !indexes.includes(element.index),
      )
      state.data.total = Math.max(state.data.total - affected, 0)
    },
    removeArrayElementsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
  },
})

export const {
  setArrayInitialState,
  loadArrayElements,
  loadArrayElementsSuccess,
  loadArrayElementsFailure,
  loadMoreArrayElements,
  loadMoreArrayElementsSuccess,
  loadMoreArrayElementsFailure,
  loadSearchingArrayElement,
  loadSearchingArrayElementSuccess,
  loadSearchingArrayElementFailure,
  updateValue,
  updateValueSuccess,
  updateValueFailure,
  resetUpdateValue,
  updateElementInArray,
  addElements,
  addElementsSuccess,
  addElementsFailure,
  removeArrayElements,
  removeArrayElementsSuccess,
  removeArrayElementsFailure,
} = arraySlice.actions

export const arraySelector = (state: RootState) => state.browser.array
export const arrayDataSelector = (state: RootState) => state.browser.array?.data
export const updateArrayValueStateSelector = (state: RootState) =>
  state.browser.array?.updateValue
export const addArrayElementsStateSelector = (state: RootState) =>
  state.browser.array?.adding

export default arraySlice.reducer

export function fetchArrayElements({
  key,
  start = '0',
  count = SCAN_COUNT_DEFAULT,
  resetData,
}: {
  key: RedisResponseBuffer
  start?: string
  count?: number
  resetData?: boolean
}) {
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
          start,
          count,
        },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(
          loadArrayElementsSuccess({
            ...data,
            searchedIndex: null,
            match: '',
          }),
        )
        dispatch(updateSelectedKeyRefreshTime(Date.now()))
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
  nextIndex,
  count = SCAN_COUNT_DEFAULT,
}: {
  key: RedisResponseBuffer
  nextIndex: string
  count?: number
}) {
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
          start: nextIndex,
          count,
        },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(
          loadMoreArrayElementsSuccess({
            ...data,
            searchedIndex: null,
            match: '',
          }),
        )
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(loadMoreArrayElementsFailure(errorMessage))
    }
  }
}

export function fetchSearchingArrayElementAction(
  key: RedisResponseBuffer,
  index: string | null,
  onSuccess?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadSearchingArrayElement(index))

    if (isNull(index)) {
      dispatch<any>(fetchArrayElements({ key }))
      return
    }

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.post(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.ARRAY_GET_ELEMENT,
        ),
        {
          keyName: key,
          index,
        },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(
          loadSearchingArrayElementSuccess({
            keyName: data.keyName,
            total: 1,
            logicalLength: state.browser.array.data.logicalLength,
            isPaginationSupported: true,
            elements: [{ index, value: data.value }],
            searchedIndex: index,
            match: '',
          }),
        )
        dispatch(updateSelectedKeyRefreshTime(Date.now()))
        onSuccess?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(loadSearchingArrayElementFailure(errorMessage))
    }
  }
}

export function searchArrayElementsAction(
  key: RedisResponseBuffer,
  match: string,
  count = SCAN_COUNT_DEFAULT,
  onSuccess?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadArrayElements(true))

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.post<GetArrayElementsResponse>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.ARRAY_SEARCH,
        ),
        {
          keyName: key,
          query: stringToBuffer(match),
          count,
        },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(
          loadArrayElementsSuccess({
            ...data,
            searchedIndex: null,
            match,
          }),
        )
        dispatch(updateSelectedKeyRefreshTime(Date.now()))
        onSuccess?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(loadArrayElementsFailure(errorMessage))
    }
  }
}

export function refreshArrayElementsAction(
  key: RedisResponseBuffer,
  resetData?: boolean,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const state = stateInit()
    const { searchedIndex, match } = state.browser.array.data

    if (searchedIndex) {
      dispatch<any>(fetchSearchingArrayElementAction(key, searchedIndex))
      return
    }

    if (match) {
      dispatch<any>(searchArrayElementsAction(key, match))
      return
    }

    dispatch<any>(fetchArrayElements({ key, resetData }))
  }
}

export function updateArrayElementAction(
  data: SetArrayElementDto,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(updateValue())
    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { status } = await apiService.patch<SetArrayElementResponse>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.ARRAY,
        ),
        data,
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        onSuccessAction?.()
        dispatch(updateValueSuccess())
        dispatch(updateElementInArray(data))
        sendEventTelemetry({
          event: getBasedOnViewTypeEvent(
            state.browser.keys?.viewType,
            TelemetryEvent.BROWSER_KEY_VALUE_EDITED,
            TelemetryEvent.TREE_VIEW_KEY_VALUE_EDITED,
          ),
          eventData: {
            databaseId: state.connections.instances?.connectedInstance?.id,
            keyType: KeyTypes.Array,
          },
        })
        dispatch<any>(refreshKeyInfoAction(data.keyName))
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(updateValueFailure(errorMessage))
      onFailAction?.()
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
          elements: data.elements.map((element) => ({
            index: element.index,
            value: stringToBuffer(element.value),
          })),
        },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        onSuccessAction?.()
        dispatch(addElementsSuccess())
        dispatch<any>(fetchKeyInfo(data.keyName))
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      onFailAction?.()
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(addElementsFailure(errorMessage))
    }
  }
}

export function deleteArrayElementsAction(
  key: RedisResponseBuffer,
  indexes: string[],
  onSuccessAction?: (newTotal: number) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(removeArrayElements())
    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } =
        await apiService.delete<DeleteArrayElementsResponse>(
          getUrl(
            state.connections.instances.connectedInstance?.id,
            ApiEndpoints.ARRAY_ELEMENTS,
          ),
          {
            data: {
              keyName: key,
              indexes,
            },
            params: { encoding },
          },
        )

      if (isStatusSuccessful(status)) {
        const newTotalValue = state.browser.array.data.total - data.affected

        onSuccessAction?.(newTotalValue)
        dispatch(
          removeArrayElementsSuccess({ indexes, affected: data.affected }),
        )
        if (newTotalValue > 0) {
          dispatch<any>(refreshKeyInfoAction(key))
          dispatch(
            addMessageNotification(
              successMessages.REMOVED_KEY_VALUE(
                key,
                stringToBuffer(indexes.join(', ')),
                'Array element',
              ),
            ),
          )
        } else {
          dispatch(deleteSelectedKeySuccess())
          dispatch(deleteKeyFromList(key))
          dispatch(addMessageNotification(successMessages.DELETED_KEY(key)))
        }
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(removeArrayElementsFailure(errorMessage))
      onFailAction?.()
    }
  }
}

export function deleteArrayRangesAction(
  key: RedisResponseBuffer,
  ranges: { start: string; end: string }[],
  onSuccessAction?: (newTotal: number) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(removeArrayElements())
    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } =
        await apiService.delete<DeleteArrayElementsResponse>(
          getUrl(
            state.connections.instances.connectedInstance?.id,
            ApiEndpoints.ARRAY_RANGES,
          ),
          {
            data: {
              keyName: key,
              ranges,
            },
            params: { encoding },
          },
        )

      if (isStatusSuccessful(status)) {
        const newTotalValue = state.browser.array.data.total - data.affected

        onSuccessAction?.(newTotalValue)
        dispatch(
          removeArrayElementsSuccess({ indexes: [], affected: data.affected }),
        )
        if (newTotalValue > 0) {
          dispatch<any>(fetchKeyInfo(key))
        } else {
          dispatch(deleteSelectedKeySuccess())
          dispatch(deleteKeyFromList(key))
          dispatch(addMessageNotification(successMessages.DELETED_KEY(key)))
        }
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(removeArrayElementsFailure(errorMessage))
      onFailAction?.()
    }
  }
}
