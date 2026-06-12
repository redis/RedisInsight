import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { IAddInstanceErrorPayload } from 'uiSrc/slices/app/notifications'
import {
  GetArrayCountResponse,
  GetArrayElementResponse,
  GetArrayLengthResponse,
  GetArrayMultiElementsResponse,
  GetArrayNextIndexResponse,
  GetArrayRangeResponse,
  GetArrayScanResponse,
} from 'apiClient'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import {
  getApiErrorMessage,
  getUrl,
  isStatusSuccessful,
  Maybe,
} from 'uiSrc/utils'

import {
  ArrayDataElement,
  StateArray,
  FetchArrayElementParams,
  FetchArrayMultiElementsParams,
  FetchArrayRangeParams,
  FetchArrayScanParams,
} from 'uiSrc/slices/interfaces/array'
import { RedisString } from 'uiSrc/slices/interfaces/app'
import { updateSelectedKeyRefreshTime } from './keys'
import { AppDispatch, RootState } from '../store'
import { addErrorNotification } from '../app/notifications'

export const initialState: StateArray = {
  loading: false,
  error: '',
  data: {
    keyName: '',
    length: '0',
    count: '0',
    elements: [],
  },
}

// Adapts an ARGETRANGE response (gap-preserving, parallel array starting at
// `start`) into the slice's `{ index, value }` shape so range and scan
// reducers can write to the same `data.elements` field.
const expandRangeElements = (
  start: string,
  values: GetArrayRangeResponse['elements'],
): ArrayDataElement[] => {
  if (!values) return []
  const base = BigInt(start)
  return values.map((value, offset) => ({
    index: (base + BigInt(offset)).toString(),
    value: (value ?? null) as ArrayDataElement['value'],
  }))
}

const arraySlice = createSlice({
  name: 'array',
  initialState,
  reducers: {
    setArrayInitialState: () => initialState,

    loadArrayRange: (
      state,
      { payload: resetData = true }: PayloadAction<Maybe<boolean>>,
    ) => {
      state.loading = true
      state.error = ''
      if (resetData) state.data = { ...initialState.data }
    },
    loadArrayRangeSuccess: (
      state,
      {
        payload,
      }: PayloadAction<{ start: string; response: GetArrayRangeResponse }>,
    ) => {
      state.data = {
        ...state.data,
        keyName: payload.response.keyName as RedisString,
        elements: expandRangeElements(payload.start, payload.response.elements),
      }
      state.loading = false
    },
    loadArrayRangeFailure: (state, { payload }: PayloadAction<string>) => {
      state.loading = false
      state.error = payload
    },

    loadArrayScanSuccess: (
      state,
      { payload }: PayloadAction<GetArrayScanResponse>,
    ) => {
      state.data = {
        ...state.data,
        keyName: payload.keyName as RedisString,
        elements: payload.elements.map((element) => ({
          index: element.index,
          value: element.value as ArrayDataElement['value'],
        })),
      }
      state.loading = false
    },

    loadArrayLengthSuccess: (
      state,
      { payload }: PayloadAction<GetArrayLengthResponse>,
    ) => {
      state.data = { ...state.data, length: payload.length }
    },

    loadArrayCountSuccess: (
      state,
      { payload }: PayloadAction<GetArrayCountResponse>,
    ) => {
      state.data = { ...state.data, count: payload.count }
    },

    loadArrayNextIndexSuccess: (
      state,
      { payload }: PayloadAction<GetArrayNextIndexResponse>,
    ) => {
      state.data = { ...state.data, nextIndex: payload.index }
    },
  },
})

export const {
  setArrayInitialState,
  loadArrayRange,
  loadArrayRangeSuccess,
  loadArrayRangeFailure,
  loadArrayScanSuccess,
  loadArrayLengthSuccess,
  loadArrayCountSuccess,
  loadArrayNextIndexSuccess,
} = arraySlice.actions

export const arraySelector = (state: RootState) => state.browser.array
export const arrayDataSelector = (state: RootState) => state.browser.array?.data

export default arraySlice.reducer

// Resolves the URL for an array endpoint scoped to the connected instance.
const arrayUrl = (state: RootState, endpoint: ApiEndpoints) =>
  getUrl(state.connections.instances.connectedInstance?.id, endpoint)

const encodingParams = (state: RootState) => ({
  params: { encoding: state.app.info.encoding },
})

// ARGETRANGE — gap-preserving fetch of a contiguous slot range.
export function fetchArrayRange(params: FetchArrayRangeParams) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadArrayRange(params.resetData))
    try {
      const state = stateInit()
      const { data, status } = await apiService.post<GetArrayRangeResponse>(
        arrayUrl(state, ApiEndpoints.ARRAY_GET_RANGE),
        { keyName: params.key, start: params.start, end: params.end },
        encodingParams(state),
      )
      if (isStatusSuccessful(status)) {
        dispatch(loadArrayRangeSuccess({ start: params.start, response: data }))
        dispatch(updateSelectedKeyRefreshTime(Date.now()))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(loadArrayRangeFailure(errorMessage))
    }
  }
}

// ARSCAN — populated-only fetch within a slot range. Gaps are skipped.
export function scanArrayRange(params: FetchArrayScanParams) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadArrayRange(params.resetData))
    try {
      const state = stateInit()
      const { data, status } = await apiService.post<GetArrayScanResponse>(
        arrayUrl(state, ApiEndpoints.ARRAY_SCAN),
        {
          keyName: params.key,
          start: params.start,
          end: params.end,
          ...(params.limit !== undefined ? { limit: params.limit } : {}),
        },
        encodingParams(state),
      )
      if (isStatusSuccessful(status)) {
        dispatch(loadArrayScanSuccess(data))
        dispatch(updateSelectedKeyRefreshTime(Date.now()))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(loadArrayRangeFailure(errorMessage))
    }
  }
}

// Shared body for the metadata reads (ARLEN / ARCOUNT / ARNEXT) — they all
// take a single keyName and write a single field into `data` on success.
async function fetchArrayMetadata<R>(
  state: RootState,
  endpoint: ApiEndpoints,
  key: RedisString,
): Promise<R | null> {
  const { data, status } = await apiService.post<R>(
    arrayUrl(state, endpoint),
    { keyName: key },
    encodingParams(state),
  )
  return isStatusSuccessful(status) ? data : null
}

export function fetchArrayLength(key: RedisString) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const data = await fetchArrayMetadata<GetArrayLengthResponse>(
        stateInit(),
        ApiEndpoints.ARRAY_GET_LENGTH,
        key,
      )
      if (data) dispatch(loadArrayLengthSuccess(data))
    } catch (error) {
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
    }
  }
}

export function fetchArrayCount(key: RedisString) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const data = await fetchArrayMetadata<GetArrayCountResponse>(
        stateInit(),
        ApiEndpoints.ARRAY_GET_COUNT,
        key,
      )
      if (data) dispatch(loadArrayCountSuccess(data))
    } catch (error) {
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
    }
  }
}

export function fetchArrayNextIndex(key: RedisString) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const data = await fetchArrayMetadata<GetArrayNextIndexResponse>(
        stateInit(),
        ApiEndpoints.ARRAY_GET_NEXT_INDEX,
        key,
      )
      if (data) dispatch(loadArrayNextIndexSuccess(data))
    } catch (error) {
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
    }
  }
}

// Point reads — used by edit/inspect flows. Results are returned via the
// optional `onSuccess` callback instead of being stored on the slice, since
// they don't influence the list view directly.
export function fetchArrayElement(
  params: FetchArrayElementParams,
  onSuccess?: (response: GetArrayElementResponse) => void,
  onFail?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { data, status } = await apiService.post<GetArrayElementResponse>(
        arrayUrl(state, ApiEndpoints.ARRAY_GET_ELEMENT),
        { keyName: params.key, index: params.index },
        encodingParams(state),
      )
      if (isStatusSuccessful(status)) onSuccess?.(data)
      else onFail?.()
    } catch (error) {
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      onFail?.()
    }
  }
}

/**
 * Reloads the array's currently-displayed surface in response to the
 * header's refresh button (dispatched via `refreshKey` in
 * `slices/browser/keys`). Refetches the default range plus length/count;
 * keeps `resetData: false` so the table doesn't flash through an empty
 * loading state.
 */
/** Inclusive default range bounds for the View tab. Mirrored client-side in
 * `pages/.../array-details/constants.ts`; kept duplicated here so the slice
 * stays free of UI-layer imports.
 */
const DEFAULT_REFRESH_START = '0'
const DEFAULT_REFRESH_END = '9'

export function refreshArray(key: RedisString) {
  return async (dispatch: AppDispatch) => {
    dispatch(fetchArrayLength(key))
    dispatch(fetchArrayCount(key))
    dispatch(
      fetchArrayRange({
        key,
        start: DEFAULT_REFRESH_START,
        end: DEFAULT_REFRESH_END,
        resetData: false,
      }),
    )
  }
}

export function fetchArrayMultiElements(
  params: FetchArrayMultiElementsParams,
  onSuccess?: (response: GetArrayMultiElementsResponse) => void,
  onFail?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { data, status } =
        await apiService.post<GetArrayMultiElementsResponse>(
          arrayUrl(state, ApiEndpoints.ARRAY_GET_ELEMENTS),
          { keyName: params.key, indexes: params.indexes },
          encodingParams(state),
        )
      if (isStatusSuccessful(status)) onSuccess?.(data)
      else onFail?.()
    } catch (error) {
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      onFail?.()
    }
  }
}
