import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import axios, { AxiosError } from 'axios'
import { IAddInstanceErrorPayload } from 'uiSrc/slices/app/notifications'
import {
  AggregateArrayResponse,
  GetArrayCountResponse,
  GetArrayLengthResponse,
  GetArrayRangeResponse,
  GetArraySearchResponse,
  GetArrayScanResponse,
} from 'apiClient'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { get } from 'lodash'
import {
  DEFAULT_ERROR_MESSAGE,
  getApiErrorMessage,
  getUrl,
  isStatusNotFoundError,
  isStatusSuccessful,
  Maybe,
} from 'uiSrc/utils'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import {
  ArrayActiveQuery,
  ArrayAggregateActiveQuery,
  ArrayDataElement,
  ArraySearchActiveQuery,
  StateArray,
  FetchArrayAggregateParams,
  FetchArrayRangeParams,
  FetchArrayScanParams,
  SearchArrayParams,
} from 'uiSrc/slices/interfaces/array'
import { RedisString, RedisResponseBuffer } from 'uiSrc/slices/interfaces/app'
import {
  updateSelectedKeyRefreshTime,
  deleteKeyFromList,
  deleteSelectedKeySuccess,
  refreshKeyInfoAction,
} from './keys'
import { AppDispatch, RootState } from '../store'
import {
  addErrorNotification,
  addMessageNotification,
} from '../app/notifications'

/** Inclusive default range bounds for the View tab. Mirrored in
 * `pages/.../array-details/constants.ts`; kept duplicated here so the slice
 * stays free of UI-layer imports.
 */
const DEFAULT_QUERY_START = '0'
const DEFAULT_QUERY_END = '9'

/**
 * Safety cap on ARSCAN result-set size. The form intentionally lets users
 * type ranges far wider than `ARRAY_RANGE_MAX_ELEMENTS` here (unlike
 * ARGETRANGE) because ARSCAN only returns populated slots, but a dense
 * 0..10M region would still blow up the response. Pin to the BE's
 * `ARRAY_RANGE_MAX_ELEMENTS` so the worst case matches what ARGETRANGE
 * already guarantees. A dedicated Limit input will replace this default
 * with the next vertical.
 */
export const DEFAULT_SCAN_LIMIT = 1_000_000

export const initialState: StateArray = {
  loading: false,
  error: '',
  query: {
    start: DEFAULT_QUERY_START,
    end: DEFAULT_QUERY_END,
    showEmpty: true,
  },
  data: {
    keyName: '',
    length: '0',
    count: '0',
    elements: [],
  },
  aggregate: {
    loading: false,
    error: '',
    result: null,
    hasResult: false,
    query: null,
  },
  search: {
    loading: false,
    error: '',
    loaded: false,
    data: [],
    query: null,
  },
}

// Adapts an ARGETRANGE response (gap-preserving, parallel array starting at
// `start`) into the slice's `{ index, value }` shape so range and scan
// reducers can write to the same `data.elements` field. Reversed ranges
// (`start > end`) step the offset downwards so the table reflects the
// descending order the BE returned the elements in.
const expandRangeElements = (
  start: string,
  end: string,
  values: GetArrayRangeResponse['elements'],
): ArrayDataElement[] => {
  if (!values) return []
  const base = BigInt(start)
  const step = BigInt(start) > BigInt(end) ? BigInt(-1) : BigInt(1)
  return values.map((value, offset) => ({
    index: (base + BigInt(offset) * step).toString(),
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
      }: PayloadAction<{
        start: string
        end: string
        response: GetArrayRangeResponse
      }>,
    ) => {
      state.data = {
        ...state.data,
        keyName: payload.response.keyName as RedisString,
        elements: expandRangeElements(
          payload.start,
          payload.end,
          payload.response.elements,
        ),
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

    /**
     * Records the query that was just dispatched so the header refresh
     * button can replay it instead of falling back to the default range.
     */
    setArrayActiveQuery: (
      state,
      { payload }: PayloadAction<ArrayActiveQuery>,
    ) => {
      state.query = payload
    },

    loadArrayAggregate: (
      state,
      {
        payload,
      }: PayloadAction<{
        query: ArrayAggregateActiveQuery
        resetData?: boolean
      }>,
    ) => {
      state.aggregate.loading = true
      state.aggregate.error = ''
      // Record the query so the header refresh can replay it. On a header
      // refresh (`resetData: false`) keep the previous result/`hasResult`
      // on screen so the recompute swaps in place without a loader flash;
      // a fresh run clears them first.
      state.aggregate.query = payload.query
      if (payload.resetData !== false) {
        state.aggregate.hasResult = false
        state.aggregate.result = null
      }
    },
    loadArrayAggregateSuccess: (
      state,
      { payload }: PayloadAction<AggregateArrayResponse>,
    ) => {
      state.aggregate.loading = false
      state.aggregate.error = ''
      state.aggregate.result = payload.result
      state.aggregate.hasResult = true
    },
    loadArrayAggregateFailure: (state, { payload }: PayloadAction<string>) => {
      state.aggregate.loading = false
      state.aggregate.error = payload
    },
    clearArrayAggregate: (state) => {
      state.aggregate = { ...initialState.aggregate }
    },

    // ARGREP search lives in its own sub-state so the View and Search tabs
    // (both mounted at once) never overwrite each other's results. The full
    // query is recorded so the header refresh button can replay it.
    loadArraySearch: (
      state,
      { payload }: PayloadAction<ArraySearchActiveQuery>,
    ) => {
      state.search.loading = true
      state.search.error = ''
      state.search.data = []
      state.search.query = payload
    },
    loadArraySearchSuccess: (
      state,
      { payload }: PayloadAction<GetArraySearchResponse>,
    ) => {
      state.search.loading = false
      state.search.loaded = true
      state.search.data = payload.elements.map((element) => ({
        index: element.index,
        value: element.value as ArrayDataElement['value'],
      }))
    },
    loadArraySearchFailure: (state, { payload }: PayloadAction<string>) => {
      state.search.loading = false
      state.search.loaded = true
      state.search.error = payload
    },
    resetArraySearch: (state) => {
      state.search = { ...initialState.search }
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
  setArrayActiveQuery,
  loadArrayAggregate,
  loadArrayAggregateSuccess,
  loadArrayAggregateFailure,
  clearArrayAggregate,
  loadArraySearch,
  loadArraySearchSuccess,
  loadArraySearchFailure,
  resetArraySearch,
} = arraySlice.actions

export const arraySelector = (state: RootState) => state.browser.array
export const arrayDataSelector = (state: RootState) => state.browser.array?.data
export const arrayAggregateSelector = (state: RootState) =>
  state.browser.array?.aggregate
export const arraySearchSelector = (state: RootState) =>
  state.browser.array?.search

export default arraySlice.reducer

// Resolves the URL for an array endpoint scoped to the connected instance.
const arrayUrl = (state: RootState, endpoint: ApiEndpoints) =>
  getUrl(state.connections.instances.connectedInstance?.id, endpoint)

const encodingParams = (state: RootState) => ({
  params: { encoding: state.app.info.encoding },
})

/**
 * Module-scoped controller shared between `fetchArrayRange` and
 * `scanArrayRange` since both write to the same `data.elements` slice.
 * A newer dispatch aborts the previous in-flight request so a slower
 * response for a previously selected key can't land on top of the
 * fresh selection's data. Mirrors the pattern used by Vector Set's
 * similarity-search preview.
 */
let arrayRangeController: AbortController | null = null

/**
 * Abort the in-flight ARGETRANGE / ARSCAN request (if any) so its late
 * response cannot dispatch into the just-cleared slice. Called by the
 * View tab hook on unmount; safe no-op when nothing is in flight.
 */
export const abortArrayRange = (): void => {
  arrayRangeController?.abort()
  arrayRangeController = null
}

// ARGETRANGE — gap-preserving fetch of a contiguous slot range.
export function fetchArrayRange(params: FetchArrayRangeParams) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    arrayRangeController?.abort()
    const controller = new AbortController()
    arrayRangeController = controller

    dispatch(loadArrayRange(params.resetData))
    dispatch(
      setArrayActiveQuery({
        start: params.start,
        end: params.end,
        showEmpty: true,
      }),
    )
    try {
      const state = stateInit()
      const { data, status } = await apiService.post<GetArrayRangeResponse>(
        arrayUrl(state, ApiEndpoints.ARRAY_GET_RANGE),
        { keyName: params.key, start: params.start, end: params.end },
        { ...encodingParams(state), signal: controller.signal },
      )
      if (controller.signal.aborted) return
      if (isStatusSuccessful(status)) {
        dispatch(
          loadArrayRangeSuccess({
            start: params.start,
            end: params.end,
            response: data,
          }),
        )
        dispatch(updateSelectedKeyRefreshTime(Date.now()))
      } else {
        dispatch(loadArrayRangeFailure(DEFAULT_ERROR_MESSAGE))
      }
    } catch (error) {
      if (axios.isCancel(error)) return
      const errorMessage = getApiErrorMessage(error as AxiosError)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(loadArrayRangeFailure(errorMessage))
    } finally {
      // Only clear the module-scoped controller if it still points to ours
      // — a later dispatch may have already swapped a fresh one in.
      if (arrayRangeController === controller) {
        arrayRangeController = null
      }
    }
  }
}

// ARSCAN — populated-only fetch within a slot range. Gaps are skipped.
export function scanArrayRange(params: FetchArrayScanParams) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    arrayRangeController?.abort()
    const controller = new AbortController()
    arrayRangeController = controller

    dispatch(loadArrayRange(params.resetData))
    dispatch(
      setArrayActiveQuery({
        start: params.start,
        end: params.end,
        showEmpty: false,
      }),
    )
    try {
      const state = stateInit()
      const { data, status } = await apiService.post<GetArrayScanResponse>(
        arrayUrl(state, ApiEndpoints.ARRAY_SCAN),
        {
          keyName: params.key,
          start: params.start,
          end: params.end,
          limit: DEFAULT_SCAN_LIMIT,
        },
        { ...encodingParams(state), signal: controller.signal },
      )
      if (controller.signal.aborted) return
      if (isStatusSuccessful(status)) {
        dispatch(loadArrayScanSuccess(data))
        dispatch(updateSelectedKeyRefreshTime(Date.now()))
      } else {
        dispatch(loadArrayRangeFailure(DEFAULT_ERROR_MESSAGE))
      }
    } catch (error) {
      if (axios.isCancel(error)) return
      const errorMessage = getApiErrorMessage(error as AxiosError)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(loadArrayRangeFailure(errorMessage))
    } finally {
      if (arrayRangeController === controller) {
        arrayRangeController = null
      }
    }
  }
}

/**
 * Search-tab counterpart to `arrayRangeController`. Kept separate so a
 * search and a View-tab range fetch can be in flight at once (both tabs
 * stay mounted) without aborting each other. A newer search aborts the
 * previous one so a slow earlier response can't land on fresh results.
 */
let arraySearchController: AbortController | null = null

/**
 * Abort the in-flight ARGREP search (if any). Called by the Search tab hook
 * on key switch / unmount; safe no-op when nothing is in flight.
 */
export const abortArraySearch = (): void => {
  arraySearchController?.abort()
  arraySearchController = null
}

// ARGREP — predicate search across the array's index range. Blank bounds are
// dropped so the server applies its `-`/`+` (whole-array) defaults; the
// connective is sent only with 2+ predicates; WITHVALUES is sent only when
// turned off (the server defaults it on, so results carry values for the
// table); LIMIT is sent only when the user sets one, otherwise the search is
// uncapped (the server omits LIMIT and returns every match).
export function searchArray(params: SearchArrayParams) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const { key, ...query } = params

    arraySearchController?.abort()
    const controller = new AbortController()
    arraySearchController = controller

    dispatch(loadArraySearch(query))
    try {
      const state = stateInit()
      const body: Record<string, unknown> = {
        keyName: key,
        predicates: query.predicates,
      }
      if (query.combinator && query.predicates.length > 1) {
        body.combinator = query.combinator
      }
      if (query.start) body.start = query.start
      if (query.end) body.end = query.end
      if (query.nocase) body.nocase = true
      if (query.withValues === false) body.withValues = false
      if (typeof query.limit === 'number') body.limit = query.limit

      const { data, status } = await apiService.post<GetArraySearchResponse>(
        arrayUrl(state, ApiEndpoints.ARRAY_SEARCH),
        body,
        { ...encodingParams(state), signal: controller.signal },
      )
      if (controller.signal.aborted) return
      if (isStatusSuccessful(status)) {
        dispatch(loadArraySearchSuccess(data))
      } else {
        dispatch(loadArraySearchFailure(DEFAULT_ERROR_MESSAGE))
      }
    } catch (error) {
      if (axios.isCancel(error)) return
      const errorMessage = getApiErrorMessage(error as AxiosError)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(loadArraySearchFailure(errorMessage))
    } finally {
      if (arraySearchController === controller) {
        arraySearchController = null
      }
    }
  }
}

/**
 * Fetches the ±N context window for one search match via ARGETRANGE and
 * returns the normalized elements. Writes nothing into the shared array
 * slice — the View tab owns `data.elements`; the search context band holds
 * this result in local component state. Pass an AbortSignal so a re-expand,
 * context-count change, or unmount can cancel the request.
 */
export function fetchArrayNeighbours(
  params: { key: RedisString; start: string; end: string },
  signal?: AbortSignal,
) {
  return async (
    _dispatch: AppDispatch,
    stateInit: () => RootState,
  ): Promise<ArrayDataElement[]> => {
    const state = stateInit()
    const { data, status } = await apiService.post<GetArrayRangeResponse>(
      arrayUrl(state, ApiEndpoints.ARRAY_GET_RANGE),
      { keyName: params.key, start: params.start, end: params.end },
      { ...encodingParams(state), signal },
    )
    if (!isStatusSuccessful(status)) {
      throw new Error(DEFAULT_ERROR_MESSAGE)
    }
    return expandRangeElements(params.start, params.end, data.elements)
  }
}

export function fetchArrayLength(key: RedisString) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { data, status } = await apiService.post<GetArrayLengthResponse>(
        arrayUrl(state, ApiEndpoints.ARRAY_GET_LENGTH),
        { keyName: key },
        encodingParams(state),
      )
      if (isStatusSuccessful(status)) dispatch(loadArrayLengthSuccess(data))
    } catch (error) {
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
    }
  }
}

export function fetchArrayCount(key: RedisString) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { data, status } = await apiService.post<GetArrayCountResponse>(
        arrayUrl(state, ApiEndpoints.ARRAY_GET_COUNT),
        { keyName: key },
        encodingParams(state),
      )
      if (isStatusSuccessful(status)) dispatch(loadArrayCountSuccess(data))
    } catch (error) {
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
    }
  }
}

// Per-element delete (ARDEL). The slice's data.count isn't kept fresh and
// arrays are sparse, so probe ARCOUNT after the delete to learn whether the
// key survived: it 404s once the last element is gone (the server drops the
// empty key). Any other ARCOUNT outcome leaves the delete intact, so the views
// are refreshed regardless rather than reporting the delete as failed.
export function deleteArrayElements(key: RedisString, indexes: string[]) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const { status } = await apiService.delete(
        arrayUrl(state, ApiEndpoints.ARRAY_ELEMENTS),
        { data: { keyName: key, indexes }, ...encodingParams(state) },
      )
      if (!isStatusSuccessful(status)) return

      sendEventTelemetry({
        event: TelemetryEvent.ARRAY_ELEMENT_DELETED,
        eventData: {
          databaseId: state.connections.instances.connectedInstance?.id,
        },
      })

      let keyDeleted = false
      try {
        await apiService.post<GetArrayCountResponse>(
          arrayUrl(state, ApiEndpoints.ARRAY_GET_COUNT),
          { keyName: key },
          encodingParams(state),
        )
      } catch (countError) {
        // 404 ⇒ the last element went and the server dropped the key. Any
        // other ARCOUNT failure is unrelated to the (already-succeeded) delete,
        // so fall through and refresh instead of masking it as a failure.
        const countStatus = get(countError, ['response', 'status'])
        keyDeleted = Boolean(countStatus && isStatusNotFoundError(countStatus))
      }

      if (keyDeleted) {
        dispatch(deleteSelectedKeySuccess())
        dispatch(deleteKeyFromList(key as RedisResponseBuffer))
        dispatch(
          addMessageNotification(
            successMessages.DELETED_KEY(key as RedisResponseBuffer),
          ),
        )
        return
      }

      // Replay every loaded array view (View range/scan, Search, Aggregate)
      // plus the counters — not just the tab that triggered the delete. All
      // three tabs stay mounted, so a sibling would otherwise keep showing the
      // deleted element (or a stale aggregate) until a manual refresh.
      dispatch(refreshArray(key))
      dispatch(refreshKeyInfoAction(key as RedisResponseBuffer))
      dispatch(
        addMessageNotification(
          successMessages.REMOVED_KEY_VALUE(
            key as RedisResponseBuffer,
            indexes.join(', ') as unknown as RedisResponseBuffer,
            'Element',
          ),
        ),
      )
    } catch (error) {
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
    }
  }
}

/**
 * Dedicated controller for AROP so an in-flight aggregate isn't aborted by
 * a concurrent range/scan in the View tab (which uses
 * `arrayRangeController`). A newer aggregate dispatch still aborts the
 * previous one so stale results don't land on top of a fresh request.
 */
let arrayAggregateController: AbortController | null = null

export const abortArrayAggregate = (): void => {
  arrayAggregateController?.abort()
  arrayAggregateController = null
}

// AROP — aggregate elements over a range.
export function aggregateArray(params: FetchArrayAggregateParams) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    arrayAggregateController?.abort()
    const controller = new AbortController()
    arrayAggregateController = controller

    dispatch(
      loadArrayAggregate({
        query: {
          start: params.start,
          end: params.end,
          operation: params.operation,
          ...(params.value !== undefined ? { value: params.value } : {}),
        },
        resetData: params.resetData,
      }),
    )
    try {
      const state = stateInit()
      const { data, status } = await apiService.post<AggregateArrayResponse>(
        arrayUrl(state, ApiEndpoints.ARRAY_AGGREGATE),
        {
          keyName: params.key,
          start: params.start,
          end: params.end,
          operation: params.operation,
          ...(params.value !== undefined ? { value: params.value } : {}),
        },
        { ...encodingParams(state), signal: controller.signal },
      )
      if (controller.signal.aborted) return
      if (isStatusSuccessful(status)) {
        dispatch(loadArrayAggregateSuccess(data))
      } else {
        dispatch(loadArrayAggregateFailure(DEFAULT_ERROR_MESSAGE))
      }
    } catch (error) {
      if (axios.isCancel(error)) return
      const errorMessage = getApiErrorMessage(error as AxiosError)
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      dispatch(loadArrayAggregateFailure(errorMessage))
    } finally {
      if (arrayAggregateController === controller) {
        arrayAggregateController = null
      }
    }
  }
}

/**
 * Reloads the array's currently-displayed surface in response to the
 * header's refresh button (dispatched via `refreshKey` in
 * `slices/browser/keys`). Replays whichever query the form last ran —
 * range/scan and the user's bounds — so refresh doesn't silently swap
 * the table for a different slice. Keeps `resetData: false` so the
 * table doesn't flash through an empty loading state. Also replays the
 * last Search-tab query so its results don't go stale after a refresh.
 */
export function refreshArray(key: RedisString) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const { query, aggregate, search } = stateInit().browser.array
    const { start, end, showEmpty } = query

    dispatch(fetchArrayLength(key))
    dispatch(fetchArrayCount(key))

    if (showEmpty) {
      dispatch(fetchArrayRange({ key, start, end, resetData: false }))
    } else {
      dispatch(scanArrayRange({ key, start, end, resetData: false }))
    }

    // Replay the last AROP so the Aggregate tab's result reflects the
    // array's current contents instead of a value computed before the
    // refresh. `resetData: false` keeps the existing value on screen while
    // the recompute is in flight (no loader flash), mirroring the
    // range/scan replay above. Only runs once an aggregate has actually
    // been computed for this key (`hasResult` + a stored query).
    if (aggregate.hasResult && aggregate.query) {
      dispatch(aggregateArray({ key, ...aggregate.query, resetData: false }))
    }

    if (search.query) {
      dispatch(searchArray({ key, ...search.query }))
    }
  }
}
