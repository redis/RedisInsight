import { AxiosError } from 'axios'
import { remove } from 'lodash'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { apiService } from 'uiSrc/services'
import { ApiEndpoints, KeyTypes } from 'uiSrc/constants'
import {
  bufferToString,
  getApiErrorMessage,
  getUrl,
  isEqualBuffers,
  isStatusSuccessful,
} from 'uiSrc/utils'
import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import {
  StateVectorSet,
  VectorSetElement,
  VectorSetSearchResult,
  VectorSetInfo,
} from 'uiSrc/slices/interfaces/vectorset'
import {
  deleteKeyFromList,
  deleteSelectedKeySuccess,
  fetchKeyInfo,
  refreshKeyInfoAction,
  updateSelectedKeyRefreshTime,
} from './keys'
import { AppDispatch, RootState } from '../store'
import {
  addErrorNotification,
  IAddInstanceErrorPayload,
} from '../app/notifications'
import { RedisResponseBuffer } from '../interfaces'

export const initialState: StateVectorSet = {
  loading: false,
  searching: false,
  error: '',
  data: {
    total: 0,
    key: undefined,
    keyName: '',
    elements: [],
    nextCursor: '0',
    info: null,
  },
  search: {
    loading: false,
    error: '',
    results: [],
    query: null,
  },
  addElement: {
    loading: false,
    error: '',
  },
  updateAttributes: {
    loading: false,
    error: '',
  },
}

const vectorsetSlice = createSlice({
  name: 'vectorset',
  initialState,
  reducers: {
    setVectorSetInitialState: () => initialState,

    // Load elements
    loadVectorSetElements: (state) => {
      state.loading = true
      state.error = ''
    },
    loadVectorSetElementsSuccess: (
      state,
      {
        payload,
      }: PayloadAction<{
        keyName: string
        total: number
        elements: VectorSetElement[]
      }>,
    ) => {
      state.loading = false
      state.data.keyName = payload.keyName
      state.data.total = payload.total
      state.data.elements = payload.elements
    },
    loadVectorSetElementsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },

    // Load more elements
    loadMoreVectorSetElements: (state) => {
      state.loading = true
    },
    loadMoreVectorSetElementsSuccess: (
      state,
      {
        payload,
      }: PayloadAction<{
        elements: VectorSetElement[]
      }>,
    ) => {
      state.loading = false
      state.data.elements = [...state.data.elements, ...payload.elements]
    },
    loadMoreVectorSetElementsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },

    // Load info
    loadVectorSetInfo: (state) => {
      state.loading = true
    },
    loadVectorSetInfoSuccess: (
      state,
      { payload }: PayloadAction<VectorSetInfo>,
    ) => {
      state.loading = false
      state.data.info = payload
    },
    loadVectorSetInfoFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },

    // Search
    searchVectorSet: (state, { payload }: PayloadAction<number[] | null>) => {
      state.search.loading = true
      state.search.error = ''
      state.search.query = payload
      state.searching = true
    },
    searchVectorSetSuccess: (
      state,
      { payload }: PayloadAction<VectorSetSearchResult[]>,
    ) => {
      state.search.loading = false
      state.search.results = payload
    },
    searchVectorSetFailure: (state, { payload }) => {
      state.search.loading = false
      state.search.error = payload
    },
    clearSearch: (state) => {
      state.search = initialState.search
      state.searching = false
    },

    // Add element
    addVectorSetElement: (state) => {
      state.addElement.loading = true
      state.addElement.error = ''
    },
    addVectorSetElementSuccess: (state) => {
      state.addElement.loading = false
    },
    addVectorSetElementFailure: (state, { payload }) => {
      state.addElement.loading = false
      state.addElement.error = payload
    },

    // Delete elements
    removeVectorSetElements: (state) => {
      state.loading = true
    },
    removeVectorSetElementsSuccess: (state) => {
      state.loading = false
    },
    removeVectorSetElementsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    removeElementsFromList: (
      state,
      { payload }: PayloadAction<RedisResponseBuffer[]>,
    ) => {
      remove(
        state.data.elements,
        (element) =>
          payload.findIndex((item) => isEqualBuffers(item, element.name)) > -1,
      )
      state.data.total = state.data.total - payload.length
    },

    // Update attributes
    updateElementAttributes: (state) => {
      state.updateAttributes.loading = true
      state.updateAttributes.error = ''
    },
    updateElementAttributesSuccess: (state) => {
      state.updateAttributes.loading = false
    },
    updateElementAttributesFailure: (state, { payload }) => {
      state.updateAttributes.loading = false
      state.updateAttributes.error = payload
    },
    updateElementInList: (
      state,
      { payload }: PayloadAction<VectorSetElement>,
    ) => {
      const index = state.data.elements.findIndex((el) =>
        isEqualBuffers(el.name, payload.name),
      )
      if (index > -1) {
        state.data.elements[index] = payload
      }
    },
  },
})

// Actions
export const {
  setVectorSetInitialState,
  loadVectorSetElements,
  loadVectorSetElementsSuccess,
  loadVectorSetElementsFailure,
  loadMoreVectorSetElements,
  loadMoreVectorSetElementsSuccess,
  loadMoreVectorSetElementsFailure,
  loadVectorSetInfo,
  loadVectorSetInfoSuccess,
  loadVectorSetInfoFailure,
  searchVectorSet,
  searchVectorSetSuccess,
  searchVectorSetFailure,
  clearSearch,
  addVectorSetElement,
  addVectorSetElementSuccess,
  addVectorSetElementFailure,
  removeVectorSetElements,
  removeVectorSetElementsSuccess,
  removeVectorSetElementsFailure,
  removeElementsFromList,
  updateElementAttributes,
  updateElementAttributesSuccess,
  updateElementAttributesFailure,
  updateElementInList,
} = vectorsetSlice.actions

// Selectors
export const vectorsetSelector = (state: RootState) => state.browser.vectorset
export const vectorsetDataSelector = (state: RootState) =>
  state.browser.vectorset?.data
export const vectorsetSearchSelector = (state: RootState) =>
  state.browser.vectorset?.search
export const vectorsetInfoSelector = (state: RootState) =>
  state.browser.vectorset?.data?.info

// Reducer
export default vectorsetSlice.reducer

// Thunks

export function fetchVectorSetElements(
  key: RedisResponseBuffer,
  count: number = 10,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadVectorSetElements())

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.post(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.VECTOR_SET_GET_ELEMENTS,
        ),
        { keyName: key, count },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(
          loadVectorSetElementsSuccess({
            keyName: bufferToString(key),
            total: data.total,
            elements: data.elements,
          }),
        )
        dispatch(updateSelectedKeyRefreshTime(Date.now()))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(loadVectorSetElementsFailure(errorMessage))
    }
  }
}

export function fetchVectorSetInfo(key: RedisResponseBuffer) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadVectorSetInfo())

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.post(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.KEY_INFO,
        ),
        { keyName: key },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(
          loadVectorSetInfoSuccess({
            size: data.length || 0,
            vectorDim: data.vinfo?.['vector-dim'] || 0,
            quantType: data.vinfo?.['quant-type'] || 'unknown',
            maxLevel: data.vinfo?.['max-level'],
            vsetUid: data.vinfo?.['vset-uid'],
            hnswMaxNodeUid: data.vinfo?.['hnsw-max-node-uid'],
          }),
        )
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(loadVectorSetInfoFailure(errorMessage))
    }
  }
}

export function searchVectorSetByVector(
  key: RedisResponseBuffer,
  vector: number[],
  count: number = 10,
  filter?: string,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(searchVectorSet(vector))

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.post(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.VECTOR_SET_SEARCH,
        ),
        {
          keyName: key,
          queryType: 'VALUES',
          vector,
          count,
          filter,
          withScores: true,
        },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(searchVectorSetSuccess(data.results))

        sendEventTelemetry({
          event: TelemetryEvent.BROWSER_KEY_VALUE_FILTERED,
          eventData: {
            databaseId: state.connections.instances?.connectedInstance?.id,
            keyType: KeyTypes.VectorSet,
            resultsCount: data.results?.length || 0,
            hasFilter: !!filter,
          },
        })
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(searchVectorSetFailure(errorMessage))
    }
  }
}

export function searchVectorSetByElement(
  key: RedisResponseBuffer,
  element: string,
  count: number = 10,
  filter?: string,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(searchVectorSet(null))

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.post(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.VECTOR_SET_SEARCH,
        ),
        {
          keyName: key,
          queryType: 'ELE',
          element,
          count,
          filter,
          withScores: true,
        },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(searchVectorSetSuccess(data.results))

        sendEventTelemetry({
          event: TelemetryEvent.BROWSER_KEY_VALUE_FILTERED,
          eventData: {
            databaseId: state.connections.instances?.connectedInstance?.id,
            keyType: KeyTypes.VectorSet,
            resultsCount: data.results?.length || 0,
            queryType: 'element',
          },
        })
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(searchVectorSetFailure(errorMessage))
    }
  }
}

export function addVectorSetElements(
  data: {
    keyName: RedisResponseBuffer
    elements: Array<{
      name: string
      vector: number[]
      attributes?: Record<string, unknown>
    }>
  },
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(addVectorSetElement())

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { status } = await apiService.put(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.VECTOR_SET,
        ),
        {
          keyName: data.keyName,
          elements: data.elements,
        },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        sendEventTelemetry({
          event: getBasedOnViewTypeEvent(
            state.browser.keys?.viewType,
            TelemetryEvent.BROWSER_KEY_VALUE_ADDED,
            TelemetryEvent.TREE_VIEW_KEY_VALUE_ADDED,
          ),
          eventData: {
            databaseId: state.connections.instances?.connectedInstance?.id,
            keyType: KeyTypes.VectorSet,
            numberOfAdded: data.elements.length,
          },
        })
        onSuccessAction?.()
        dispatch(addVectorSetElementSuccess())
        dispatch<any>(fetchKeyInfo(data.keyName))
      }
    } catch (error) {
      onFailAction?.()
      const errorMessage = getApiErrorMessage(error as AxiosError)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(addVectorSetElementFailure(errorMessage))
    }
  }
}

export function deleteVectorSetElements(
  key: RedisResponseBuffer,
  elements: RedisResponseBuffer[],
  onSuccessAction?: (newTotal: number) => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(removeVectorSetElements())

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.delete(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.VECTOR_SET_ELEMENTS,
        ),
        {
          data: { keyName: key, elements },
          params: { encoding },
        },
      )

      if (isStatusSuccessful(status)) {
        const newTotalValue = state.browser.vectorset.data.total - data.affected

        dispatch(removeVectorSetElementsSuccess())
        dispatch(removeElementsFromList(elements))

        if (newTotalValue > 0) {
          dispatch<any>(refreshKeyInfoAction(key))
        } else {
          dispatch(deleteSelectedKeySuccess())
          dispatch(deleteKeyFromList(key))
        }

        // Success notification handled by calling component via callback
        onSuccessAction?.(newTotalValue)
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(removeVectorSetElementsFailure(errorMessage))
    }
  }
}

export function updateVectorSetElementAttributes(
  key: RedisResponseBuffer,
  element: RedisResponseBuffer,
  attributes: Record<string, unknown>,
  onSuccessAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(updateElementAttributes())

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { status } = await apiService.patch(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.VECTOR_SET_ATTRIBUTES,
        ),
        {
          keyName: key,
          element,
          attributes,
        },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        onSuccessAction?.()
        dispatch(updateElementAttributesSuccess())
        dispatch<any>(refreshKeyInfoAction(key))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(updateElementAttributesFailure(errorMessage))
    }
  }
}

export function refreshVectorSetAction(key: RedisResponseBuffer) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const state = stateInit()
    const { searching } = state.browser.vectorset

    if (searching) {
      // If we were searching, just clear search and reload elements
      dispatch(clearSearch())
    }

    dispatch<any>(fetchVectorSetElements(key))
    dispatch<any>(fetchVectorSetInfo(key))
  }
}
