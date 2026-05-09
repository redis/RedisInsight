import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError, AxiosResponseHeaders } from 'axios'

import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import {
  bufferToString,
  DEFAULT_ERROR_MESSAGE,
  getApiErrorMessage,
  getUrl,
  isEqualBuffers,
  isStatusSuccessful,
  Maybe,
  stringToBuffer,
} from 'uiSrc/utils'
import successMessages from 'uiSrc/components/notifications/success-messages'

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
  AddVectorSetElementsData,
  AddVectorSetElementsState,
  FetchMoreVectorSetElementsParams,
  FetchVectorSetElementsParams,
  GetVectorSetElementsResponse,
  InitialStateVectorSet,
  VectorSetData,
  VectorSetElement,
  VectorSetSimilaritySearchPayload,
  VectorSetSimilaritySearchPreviewPayload,
  VectorSetSimilaritySearchPreviewResponse,
  VectorSetSimilaritySearchPreviewState,
  VectorSetSimilaritySearchResponse,
  VectorSetSimilaritySearchState,
} from '../interfaces/vectorSet'
import {
  addErrorNotification,
  addMessageNotification,
  IAddInstanceErrorPayload,
} from '../app/notifications'

const VECTOR_SET_COUNT_DEFAULT = 10

export const initialState: InitialStateVectorSet = {
  loading: false,
  downloading: false,
  error: '',
  data: {
    total: 0,
    key: undefined,
    keyName: '',
    nextCursor: undefined,
    elements: [],
  },
  adding: {
    loading: false,
    error: '',
  },
  similaritySearch: {
    loading: false,
    error: '',
    data: undefined,
  },
  similaritySearchPreview: {
    loading: false,
    error: '',
    preview: '',
  },
}

const vectorSetSlice = createSlice({
  name: 'vectorSet',
  initialState,
  reducers: {
    loadVectorSetElements: (
      state,
      { payload: resetData = true }: PayloadAction<Maybe<boolean>>,
    ) => {
      state.loading = true
      state.error = ''

      if (resetData) {
        state.data = initialState.data
      }
    },
    loadVectorSetElementsSuccess: (
      state,
      { payload }: PayloadAction<VectorSetData>,
    ) => {
      state.data = {
        ...state.data,
        ...payload,
      }
      state.loading = false
    },
    loadVectorSetElementsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },

    loadMoreVectorSetElements: (state) => {
      state.loading = true
      state.error = ''
    },
    loadMoreVectorSetElementsSuccess: (
      state,
      {
        payload: { elements, nextCursor, ...rest },
      }: PayloadAction<VectorSetData>,
    ) => {
      state.loading = false
      state.data = {
        ...state.data,
        ...rest,
        nextCursor,
        elements: (state.data?.elements ?? []).concat(elements),
      }
    },
    loadMoreVectorSetElementsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },

    removeVectorSetElements: (state) => {
      state.loading = true
      state.error = ''
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
      { payload: elements }: PayloadAction<RedisResponseBuffer[]>,
    ) => {
      state.data.elements = state.data.elements.filter(
        (el) => !elements.some((element) => isEqualBuffers(el.name, element)),
      )
      state.data.total -= elements.length
    },
    updateElementAttributes: (
      state,
      {
        payload,
      }: PayloadAction<{
        element: RedisResponseBuffer
        attributes: string
      }>,
    ) => {
      const el = state.data.elements.find((e) =>
        isEqualBuffers(e.name, payload.element),
      )
      if (el) {
        el.attributes = payload.attributes
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

    downloadVectorSetEmbedding: (state) => {
      state.downloading = true
    },
    downloadVectorSetEmbeddingSuccess: (state) => {
      state.downloading = false
    },
    downloadVectorSetEmbeddingFailure: (state, { payload }) => {
      state.downloading = false
      state.error = payload
    },

    loadSimilaritySearch: (state) => {
      state.similaritySearch = {
        ...state.similaritySearch,
        loading: true,
        error: '',
      }
    },
    loadSimilaritySearchSuccess: (
      state,
      { payload }: PayloadAction<VectorSetSimilaritySearchResponse>,
    ) => {
      state.similaritySearch = {
        loading: false,
        error: '',
        data: payload,
      }
    },
    loadSimilaritySearchFailure: (
      state,
      { payload }: PayloadAction<string>,
    ) => {
      state.similaritySearch = {
        ...state.similaritySearch,
        loading: false,
        error: payload,
      }
    },
    clearSimilaritySearch: (state) => {
      state.similaritySearch = initialState.similaritySearch
    },

    loadSimilaritySearchPreview: (state) => {
      state.similaritySearchPreview = {
        ...state.similaritySearchPreview,
        loading: true,
        error: '',
      }
    },
    loadSimilaritySearchPreviewSuccess: (
      state,
      { payload }: PayloadAction<string>,
    ) => {
      state.similaritySearchPreview = {
        loading: false,
        error: '',
        preview: payload,
      }
    },
    loadSimilaritySearchPreviewFailure: (
      state,
      { payload }: PayloadAction<string>,
    ) => {
      state.similaritySearchPreview = {
        ...state.similaritySearchPreview,
        loading: false,
        error: payload,
      }
    },
    clearSimilaritySearchPreview: (state) => {
      state.similaritySearchPreview = initialState.similaritySearchPreview
    },
  },
})

export const {
  loadVectorSetElements,
  loadVectorSetElementsSuccess,
  loadVectorSetElementsFailure,
  loadMoreVectorSetElements,
  loadMoreVectorSetElementsSuccess,
  loadMoreVectorSetElementsFailure,
  removeVectorSetElements,
  removeVectorSetElementsSuccess,
  removeVectorSetElementsFailure,
  removeElementsFromList,
  updateElementAttributes,
  addElements,
  addElementsSuccess,
  addElementsFailure,
  downloadVectorSetEmbedding,
  downloadVectorSetEmbeddingSuccess,
  downloadVectorSetEmbeddingFailure,
  loadSimilaritySearch,
  loadSimilaritySearchSuccess,
  loadSimilaritySearchFailure,
  clearSimilaritySearch,
  loadSimilaritySearchPreview,
  loadSimilaritySearchPreviewSuccess,
  loadSimilaritySearchPreviewFailure,
  clearSimilaritySearchPreview,
} = vectorSetSlice.actions

export const vectorSetSelector = (state: RootState) => state.browser.vectorSet
export const vectorSetDataSelector = (state: RootState) =>
  state.browser.vectorSet?.data
export const addVectorSetElementsStateSelector = (
  state: RootState,
): AddVectorSetElementsState => state.browser.vectorSet?.adding
export const vectorSetSimilaritySearchSelector = (
  state: RootState,
): VectorSetSimilaritySearchState => state.browser.vectorSet?.similaritySearch
export const vectorSetSimilaritySearchPreviewSelector = (
  state: RootState,
): VectorSetSimilaritySearchPreviewState =>
  state.browser.vectorSet?.similaritySearchPreview

export default vectorSetSlice.reducer

export function fetchVectorSetElements({
  key,
  count = VECTOR_SET_COUNT_DEFAULT,
  resetData,
}: FetchVectorSetElementsParams) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadVectorSetElements(resetData))

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } =
        await apiService.post<GetVectorSetElementsResponse>(
          getUrl(
            state.connections.instances.connectedInstance?.id,
            ApiEndpoints.VECTOR_SET_GET_ELEMENTS,
          ),
          {
            keyName: key,
            count,
          },
          { params: { encoding } },
        )

      if (isStatusSuccessful(status)) {
        const { elementNames, ...rest } = data
        dispatch(
          loadVectorSetElementsSuccess({
            ...rest,
            elements: elementNames.map((name) => ({ name })),
          }),
        )
        dispatch(updateSelectedKeyRefreshTime(Date.now()))
      } else {
        dispatch(loadVectorSetElementsFailure(DEFAULT_ERROR_MESSAGE))
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(loadVectorSetElementsFailure(errorMessage))
    }
  }
}

export function fetchMoreVectorSetElements({
  key,
  nextCursor,
  count = VECTOR_SET_COUNT_DEFAULT,
}: FetchMoreVectorSetElementsParams) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadMoreVectorSetElements())

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } =
        await apiService.post<GetVectorSetElementsResponse>(
          getUrl(
            state.connections.instances.connectedInstance?.id,
            ApiEndpoints.VECTOR_SET_GET_ELEMENTS,
          ),
          {
            keyName: key,
            start: nextCursor,
            count,
          },
          { params: { encoding } },
        )

      if (isStatusSuccessful(status)) {
        const { elementNames, ...rest } = data
        dispatch(
          loadMoreVectorSetElementsSuccess({
            ...rest,
            elements: elementNames.map((name) => ({ name })),
          }),
        )
      } else {
        dispatch(loadMoreVectorSetElementsFailure(DEFAULT_ERROR_MESSAGE))
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(loadMoreVectorSetElementsFailure(errorMessage))
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
          data: {
            keyName: key,
            elements,
          },
          params: { encoding },
        },
      )

      if (isStatusSuccessful(status)) {
        const newTotalValue = state.browser.vectorSet.data.total - data.affected

        onSuccessAction?.(newTotalValue)
        dispatch(removeVectorSetElementsSuccess())
        dispatch(removeElementsFromList(elements))
        if (newTotalValue > 0) {
          dispatch<any>(refreshKeyInfoAction(key))
          dispatch(
            addMessageNotification(
              successMessages.REMOVED_KEY_VALUE(
                key,
                elements.map((element) => bufferToString(element)).join(''),
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
        dispatch(removeVectorSetElementsFailure(DEFAULT_ERROR_MESSAGE))
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(removeVectorSetElementsFailure(errorMessage))
    }
  }
}

export function getVectorSetElementDetails(
  key: RedisResponseBuffer,
  element: RedisResponseBuffer,
  onSuccessAction?: (details: VectorSetElement) => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.post<VectorSetElement>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.VECTOR_SET_GET_ELEMENT_DETAILS,
        ),
        {
          keyName: key,
          element,
        },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(
          updateElementAttributes({
            element,
            attributes: data.attributes ?? '',
          }),
        )
        onSuccessAction?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
    }
  }
}

export function setVectorSetElementAttribute(
  key: RedisResponseBuffer,
  element: RedisResponseBuffer,
  attributes: string,
  onSuccessAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.put<{ attributes: string }>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.VECTOR_SET_ELEMENT_ATTRIBUTES,
        ),
        {
          keyName: key,
          element,
          attributes,
        },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(
          updateElementAttributes({
            element,
            attributes: data.attributes,
          }),
        )
        onSuccessAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
    }
  }
}

export function addVectorSetElements(
  data: AddVectorSetElementsData,
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
          ApiEndpoints.VECTOR_SET,
        ),
        {
          keyName: data.keyName,
          elements: data.elements.map((el) => ({
            name: stringToBuffer(el.name),
            ...(el.vectorFp32 !== undefined
              ? { vectorFp32: el.vectorFp32 }
              : { vectorValues: el.vectorValues }),
            ...(el.attributes ? { attributes: el.attributes } : {}),
          })),
        },
        { params: { encoding } },
      )
      if (isStatusSuccessful(status)) {
        onSuccessAction?.()
        dispatch(addElementsSuccess())
        dispatch<any>(fetchKeyInfo(data.keyName))
      } else {
        onFailAction?.()
        dispatch(addElementsFailure(DEFAULT_ERROR_MESSAGE))
      }
    } catch (_err) {
      const error = _err as AxiosError
      onFailAction?.()
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(addElementsFailure(errorMessage))
    }
  }
}

export function fetchDownloadVectorEmbedding(
  key: RedisResponseBuffer,
  element: RedisResponseBuffer,
  onSuccessAction?: (data: string, headers: AxiosResponseHeaders) => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(downloadVectorSetEmbedding())

    try {
      const state = stateInit()
      const { data, status, headers } = await apiService.post(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.VECTOR_SET_DOWNLOAD_EMBEDDING,
        ),
        {
          keyName: key,
          element,
        },
        { responseType: 'arraybuffer' },
      )

      if (isStatusSuccessful(status)) {
        dispatch(downloadVectorSetEmbeddingSuccess())
        onSuccessAction?.(data, headers)
      } else {
        dispatch(downloadVectorSetEmbeddingFailure(DEFAULT_ERROR_MESSAGE))
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(downloadVectorSetEmbeddingFailure(errorMessage))
    }
  }
}

export function fetchVectorSetSimilaritySearch(
  payload: VectorSetSimilaritySearchPayload,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadSimilaritySearch())

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } =
        await apiService.post<VectorSetSimilaritySearchResponse>(
          getUrl(
            state.connections.instances.connectedInstance?.id,
            ApiEndpoints.VECTOR_SET_SIMILARITY_SEARCH,
          ),
          payload,
          { params: { encoding } },
        )

      if (isStatusSuccessful(status)) {
        dispatch(loadSimilaritySearchSuccess(data))
      } else {
        dispatch(loadSimilaritySearchFailure(DEFAULT_ERROR_MESSAGE))
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(loadSimilaritySearchFailure(errorMessage))
    }
  }
}

/**
 * Fetch the BE-built `VSIM` command preview for the supplied form DTO.
 * The BE reuses the same command builder as the search endpoint, so the
 * preview is guaranteed to match the command that would actually run when
 * the user submits the form. Intended to be called debounced from the
 * similarity-search form on every change.
 *
 * Errors are stored in the slice but intentionally _not_ surfaced as toasts:
 * preview is best-effort and a transient 4xx (e.g. user typed both element
 * and vector during a transition) should not yell at the user.
 */
export function fetchVectorSetSimilaritySearchPreview(
  payload: VectorSetSimilaritySearchPreviewPayload,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadSimilaritySearchPreview())

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } =
        await apiService.post<VectorSetSimilaritySearchPreviewResponse>(
          getUrl(
            state.connections.instances.connectedInstance?.id,
            ApiEndpoints.VECTOR_SET_SIMILARITY_SEARCH_PREVIEW,
          ),
          payload,
          { params: { encoding } },
        )

      if (isStatusSuccessful(status)) {
        dispatch(loadSimilaritySearchPreviewSuccess(data.preview))
      } else {
        dispatch(loadSimilaritySearchPreviewFailure(DEFAULT_ERROR_MESSAGE))
      }
    } catch (_err) {
      const error = _err as AxiosError
      dispatch(loadSimilaritySearchPreviewFailure(getApiErrorMessage(error)))
    }
  }
}
