import axios from 'axios'
import { cloneDeep } from 'lodash'
import { apiService } from 'uiSrc/services'
import { DEFAULT_ERROR_MESSAGE } from 'uiSrc/utils'
import { IAddInstanceErrorPayload } from 'uiSrc/slices/app/notifications'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
  mockStore,
} from 'uiSrc/utils/test-utils'
import { MOCK_TIMESTAMP } from 'uiSrc/mocks/data/dateNow'

import reducer, {
  abortArrayRange,
  abortArraySearch,
  initialState,
  setArrayInitialState,
  setArrayActiveQuery,
  loadArrayRange,
  loadArrayRangeSuccess,
  loadArrayRangeFailure,
  loadArrayScanSuccess,
  loadArrayLengthSuccess,
  loadArrayCountSuccess,
  loadArraySearch,
  loadArraySearchSuccess,
  loadArraySearchFailure,
  resetArraySearch,
  updateArrayElement,
  setArrayUpdating,
  arraySelector,
  arrayDataSelector,
  arraySearchSelector,
  fetchArrayRange,
  scanArrayRange,
  fetchArrayLength,
  fetchArrayCount,
  refreshArray,
  searchArray,
  updateArrayElementAction,
} from '../../browser/array'
import { arrayGrepPredicateFactory } from 'uiSrc/mocks/factories/browser/array/arrayGrepPredicate.factory'
import { updateSelectedKeyRefreshTime } from '../../browser/keys'
import { addErrorNotification } from '../../app/notifications'
import {
  ArrayAggregateOperation,
  ArrayCombinator,
} from '../../interfaces/array'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
}))

// A plain `string` is a valid RedisString, and avoids enum-vs-literal
// friction with the generated DTO types (which model the Buffer branch as
// `{ type: 'Buffer'; data: number[] }`).
const mockKey = 'readings'

let store: typeof mockedStore
let dateNow: jest.SpyInstance<number>

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('array slice', () => {
  beforeAll(() => {
    dateNow = jest.spyOn(Date, 'now').mockImplementation(() => MOCK_TIMESTAMP)
  })

  afterAll(() => {
    dateNow.mockRestore()
  })

  describe('reducers', () => {
    it('setArrayInitialState restores the initial state', () => {
      const dirty = {
        ...initialState,
        loading: true,
        error: 'boom',
        data: { ...initialState.data, length: '99' },
      }
      expect(reducer(dirty, setArrayInitialState())).toEqual(initialState)
    })

    it('loadArrayRange flips loading and resets data when requested', () => {
      const next = reducer(
        { ...initialState, data: { ...initialState.data, length: '5' } },
        loadArrayRange(true),
      )
      expect(next.loading).toBe(true)
      expect(next.error).toBe('')
      expect(next.data).toEqual(initialState.data)
    })

    it('loadArrayRange keeps data when resetData=false', () => {
      const seeded = {
        ...initialState,
        data: { ...initialState.data, length: '5' },
      }
      const next = reducer(seeded, loadArrayRange(false))
      expect(next.loading).toBe(true)
      expect(next.data.length).toBe('5')
    })

    it('loadArrayRangeSuccess expands gap-preserving slots from start', () => {
      const next = reducer(
        initialState,
        loadArrayRangeSuccess({
          start: '10',
          end: '12',
          response: {
            keyName: mockKey,
            elements: ['a', null, 'b'],
          },
        }),
      )
      expect(next.loading).toBe(false)
      expect(next.data.keyName).toEqual(mockKey)
      expect(next.data.elements).toEqual([
        { index: '10', value: 'a' },
        { index: '11', value: null },
        { index: '12', value: 'b' },
      ])
    })

    it('loadArrayRangeSuccess steps the offset downwards for reversed ranges', () => {
      const next = reducer(
        initialState,
        loadArrayRangeSuccess({
          start: '12',
          end: '10',
          response: {
            keyName: mockKey,
            elements: ['c', null, 'a'],
          },
        }),
      )
      expect(next.data.elements).toEqual([
        { index: '12', value: 'c' },
        { index: '11', value: null },
        { index: '10', value: 'a' },
      ])
    })

    it('loadArrayRangeFailure records the error', () => {
      const next = reducer(
        { ...initialState, loading: true },
        loadArrayRangeFailure('boom'),
      )
      expect(next).toEqual({ ...initialState, loading: false, error: 'boom' })
    })

    it('loadArrayScanSuccess passes elements through as-is', () => {
      const next = reducer(
        { ...initialState, loading: true },
        loadArrayScanSuccess({
          keyName: mockKey,
          elements: [
            { index: '0', value: 'a' },
            { index: '5', value: 'b' },
          ],
        }),
      )
      expect(next.loading).toBe(false)
      expect(next.data.elements).toEqual([
        { index: '0', value: 'a' },
        { index: '5', value: 'b' },
      ])
    })

    it('loadArrayLengthSuccess writes only length', () => {
      const next = reducer(
        initialState,
        loadArrayLengthSuccess({ keyName: mockKey, length: '42' }),
      )
      expect(next.data.length).toBe('42')
      expect(next.data.count).toBe(initialState.data.count)
    })

    it('loadArrayCountSuccess writes only count', () => {
      const next = reducer(
        initialState,
        loadArrayCountSuccess({ keyName: mockKey, count: '7' }),
      )
      expect(next.data.count).toBe('7')
    })

    it('updateArrayElement replaces the value of the matching index only', () => {
      const dirty = {
        ...initialState,
        data: {
          ...initialState.data,
          elements: [
            { index: '0', value: 'a' },
            { index: '5', value: 'b' },
          ],
        },
      }
      const next = reducer(
        dirty,
        updateArrayElement({ index: '5', value: 'B' }),
      )
      expect(next.data.elements).toEqual([
        { index: '0', value: 'a' },
        { index: '5', value: 'B' },
      ])
    })

    it('updateArrayElement is a no-op when the index is not loaded', () => {
      const dirty = {
        ...initialState,
        data: {
          ...initialState.data,
          elements: [{ index: '0', value: 'a' }],
        },
      }
      const next = reducer(
        dirty,
        updateArrayElement({ index: '9', value: 'x' }),
      )
      expect(next.data.elements).toEqual([{ index: '0', value: 'a' }])
    })

    it('setArrayUpdating toggles the in-flight ARSET flag', () => {
      const next = reducer(initialState, setArrayUpdating(true))
      expect(next.updating).toBe(true)
      expect(reducer(next, setArrayUpdating(false)).updating).toBe(false)
    })

    it('updateArrayElement patches the Search results too (shared table)', () => {
      const dirty = {
        ...initialState,
        data: {
          ...initialState.data,
          elements: [{ index: '5', value: 'b' }],
        },
        search: {
          ...initialState.search,
          data: [{ index: '5', value: 'b' }],
        },
      }
      const next = reducer(
        dirty,
        updateArrayElement({ index: '5', value: 'B' }),
      )
      expect(next.data.elements).toEqual([{ index: '5', value: 'B' }])
      // The Search tab renders the same ArrayDetailsTable from search.data, so
      // an edit issued there must reflect in the search results too.
      expect(next.search.data).toEqual([{ index: '5', value: 'B' }])
    })

    describe('search sub-state', () => {
      const dirtySearch = {
        ...initialState,
        search: {
          loading: false,
          error: 'boom',
          loaded: true,
          data: [{ index: '1', value: 'x' }],
          query: { predicates: arrayGrepPredicateFactory.buildList(1) },
        },
      }

      it('loadArraySearch flips loading, drops stale results, and records the full query', () => {
        const query = {
          predicates: arrayGrepPredicateFactory.buildList(2),
          combinator: ArrayCombinator.And,
          nocase: true,
          limit: 500,
        }
        const next = reducer(dirtySearch, loadArraySearch(query))
        expect(next.search.loading).toBe(true)
        expect(next.search.error).toBe('')
        expect(next.search.data).toEqual([])
        // `loaded` stays put until the request resolves — the tab keeps
        // showing the loading state rather than briefly going blank.
        expect(next.search.loaded).toBe(true)
        // Records predicates + options so refresh can replay the full query.
        expect(next.search.query).toEqual(query)
      })

      it('loadArraySearchSuccess stores matches (u64 index as string) and marks loaded', () => {
        const next = reducer(
          {
            ...initialState,
            search: { ...initialState.search, loading: true },
          },
          loadArraySearchSuccess({
            keyName: mockKey,
            elements: [
              { index: '3', value: 'a' },
              { index: '900719925474099300000', value: null },
            ],
          }),
        )
        expect(next.search.loading).toBe(false)
        expect(next.search.loaded).toBe(true)
        expect(next.search.error).toBe('')
        expect(next.search.data).toEqual([
          { index: '3', value: 'a' },
          { index: '900719925474099300000', value: null },
        ])
      })

      it('loadArraySearchFailure records a distinct error and marks loaded', () => {
        const next = reducer(
          {
            ...initialState,
            search: { ...initialState.search, loading: true },
          },
          loadArraySearchFailure('nope'),
        )
        expect(next.search.loading).toBe(false)
        expect(next.search.loaded).toBe(true)
        expect(next.search.error).toBe('nope')
        expect(next.search.data).toEqual([])
      })

      it('resetArraySearch restores the initial search sub-state only', () => {
        const next = reducer(dirtySearch, resetArraySearch())
        expect(next.search).toEqual(initialState.search)
        // View-tab range state is untouched.
        expect(next.data).toEqual(dirtySearch.data)
      })
    })
  })

  describe('selectors', () => {
    it('arraySelector and arrayDataSelector read from state.browser.array', () => {
      const next = reducer(
        initialState,
        loadArrayLengthSuccess({ keyName: mockKey, length: '3' }),
      )
      const root = {
        ...initialStateDefault,
        browser: { ...initialStateDefault.browser, array: next },
      }
      expect(arraySelector(root)).toEqual(next)
      expect(arrayDataSelector(root)).toEqual(next.data)
    })

    it('arraySearchSelector reads state.browser.array.search', () => {
      const next = reducer(
        initialState,
        loadArraySearchSuccess({
          keyName: mockKey,
          elements: [{ index: '0', value: 'a' }],
        }),
      )
      const root = {
        ...initialStateDefault,
        browser: { ...initialStateDefault.browser, array: next },
      }
      expect(arraySearchSelector(root)).toEqual(next.search)
    })
  })

  describe('thunks', () => {
    describe('fetchArrayRange', () => {
      it('dispatches success + refresh-time on 200', async () => {
        const response = {
          status: 200,
          data: { keyName: mockKey, elements: ['a', null] },
        }
        apiService.post = jest.fn().mockResolvedValue(response)

        await store.dispatch<any>(
          fetchArrayRange({ key: mockKey, start: '0', end: '1' }),
        )

        expect(store.getActions()).toEqual([
          loadArrayRange(undefined),
          setArrayActiveQuery({ start: '0', end: '1', showEmpty: true }),
          loadArrayRangeSuccess({
            start: '0',
            end: '1',
            response: response.data,
          }),
          updateSelectedKeyRefreshTime(MOCK_TIMESTAMP),
        ])
      })

      it('dispatches failure + notification on error', async () => {
        const errorMessage = 'boom'
        const rejected = {
          response: { status: 500, data: { message: errorMessage } },
        }
        apiService.post = jest.fn().mockRejectedValue(rejected)

        await store.dispatch<any>(
          fetchArrayRange({ key: mockKey, start: '0', end: '1' }),
        )

        expect(store.getActions()).toEqual([
          loadArrayRange(undefined),
          setArrayActiveQuery({ start: '0', end: '1', showEmpty: true }),
          addErrorNotification(rejected as IAddInstanceErrorPayload),
          loadArrayRangeFailure(errorMessage),
        ])
      })

      it('dispatches failure when the response resolves with a non-success status', async () => {
        apiService.post = jest
          .fn()
          .mockResolvedValue({ status: 304, data: null })

        await store.dispatch<any>(
          fetchArrayRange({ key: mockKey, start: '0', end: '1' }),
        )

        expect(store.getActions()).toEqual([
          loadArrayRange(undefined),
          setArrayActiveQuery({ start: '0', end: '1', showEmpty: true }),
          loadArrayRangeFailure(DEFAULT_ERROR_MESSAGE),
        ])
      })
    })

    describe('scanArrayRange', () => {
      it('dispatches success + refresh-time on 200', async () => {
        const response = {
          status: 200,
          data: {
            keyName: mockKey,
            elements: [{ index: '0', value: 'a' }],
          },
        }
        apiService.post = jest.fn().mockResolvedValue(response)

        await store.dispatch<any>(
          scanArrayRange({ key: mockKey, start: '0', end: '10' }),
        )

        expect(store.getActions()).toEqual([
          loadArrayRange(undefined),
          setArrayActiveQuery({ start: '0', end: '10', showEmpty: false }),
          loadArrayScanSuccess(response.data),
          updateSelectedKeyRefreshTime(MOCK_TIMESTAMP),
        ])
      })

      it('sends the default safety LIMIT so wide ranges stay bounded', async () => {
        // ARSCAN has no span cap on the BE; the UI form allows ranges far
        // wider than 1M for sparse browsing. Without LIMIT, a dense
        // 0..10M range would return millions of elements — the thunk
        // always pins LIMIT to the BE's ARRAY_RANGE_MAX_ELEMENTS.
        apiService.post = jest.fn().mockResolvedValue({
          status: 200,
          data: { keyName: mockKey, elements: [] },
        })

        await store.dispatch<any>(
          scanArrayRange({ key: mockKey, start: '0', end: '10000000' }),
        )

        const [, body] = (apiService.post as jest.Mock).mock.calls[0]
        expect(body).toEqual({
          keyName: mockKey,
          start: '0',
          end: '10000000',
          limit: 1_000_000,
        })
      })

      it('dispatches failure when the response resolves with a non-success status', async () => {
        apiService.post = jest
          .fn()
          .mockResolvedValue({ status: 304, data: null })

        await store.dispatch<any>(
          scanArrayRange({ key: mockKey, start: '0', end: '10' }),
        )

        expect(store.getActions()).toEqual([
          loadArrayRange(undefined),
          setArrayActiveQuery({ start: '0', end: '10', showEmpty: false }),
          loadArrayRangeFailure(DEFAULT_ERROR_MESSAGE),
        ])
      })
    })

    describe('abort plumbing (race-safety)', () => {
      afterEach(() => abortArrayRange())

      it('passes an AbortSignal to apiService.post', async () => {
        apiService.post = jest.fn().mockResolvedValue({
          status: 200,
          data: { keyName: mockKey, elements: [] },
        })

        await store.dispatch<any>(
          fetchArrayRange({ key: mockKey, start: '0', end: '1' }),
        )

        const [, , config] = (apiService.post as jest.Mock).mock.calls[0]
        expect(config?.signal).toBeInstanceOf(AbortSignal)
      })

      it('does not dispatch success/failure when the request is aborted', async () => {
        let capturedSignal: AbortSignal | undefined
        apiService.post = jest
          .fn()
          .mockImplementation((_url, _body, config) => {
            capturedSignal = config?.signal
            return new Promise((_resolve, reject) => {
              capturedSignal?.addEventListener('abort', () => {
                reject(new axios.Cancel('aborted by client'))
              })
            })
          })

        const dispatchPromise = store.dispatch<any>(
          fetchArrayRange({ key: mockKey, start: '0', end: '1' }),
        )

        abortArrayRange()
        await dispatchPromise

        expect(store.getActions()).toEqual([
          loadArrayRange(undefined),
          setArrayActiveQuery({ start: '0', end: '1', showEmpty: true }),
        ])
      })

      it('aborts the previous in-flight range request when a newer dispatch is made', async () => {
        const signals: AbortSignal[] = []
        apiService.post = jest
          .fn()
          .mockImplementation((_url, _body, config) => {
            signals.push(config?.signal)
            return new Promise((resolve, reject) => {
              config?.signal?.addEventListener('abort', () => {
                reject(new axios.Cancel('aborted by client'))
              })
              // Resolve only the second call; the first stays pending so the
              // newer dispatch can abort it.
              if (signals.length > 1) {
                resolve({
                  status: 200,
                  data: { keyName: mockKey, elements: ['b'] },
                })
              }
            })
          })

        const first = store.dispatch<any>(
          fetchArrayRange({ key: mockKey, start: '0', end: '1' }),
        )
        const second = store.dispatch<any>(
          scanArrayRange({ key: mockKey, start: '2', end: '3' }),
        )

        await Promise.all([first, second])

        expect(signals[0].aborted).toBe(true)
        expect(signals[1].aborted).toBe(false)
      })
    })

    describe('refreshArray', () => {
      // `mockedStore` snapshots `initialStateDefault` and ignores dispatched
      // actions, so use the factory to seed the active query into state.
      const storeWithQuery = (query: {
        start: string
        end: string
        showEmpty: boolean
      }) =>
        mockStore({
          ...initialStateDefault,
          browser: {
            ...initialStateDefault.browser,
            array: { ...initialState, query },
          },
        })

      it('replays the active range query (showEmpty: true → ARGETRANGE)', async () => {
        apiService.post = jest
          .fn()
          .mockResolvedValue({ status: 200, data: { keyName: mockKey } })
        const local = storeWithQuery({
          start: '5',
          end: '15',
          showEmpty: true,
        })

        await local.dispatch<any>(refreshArray(mockKey))

        const rangeCall = (apiService.post as jest.Mock).mock.calls.find(
          ([url]) => url.includes('array/get-range'),
        )
        expect(rangeCall?.[1]).toEqual({
          keyName: mockKey,
          start: '5',
          end: '15',
        })
        expect(
          (apiService.post as jest.Mock).mock.calls.find(([url]) =>
            url.includes('array/scan'),
          ),
        ).toBeUndefined()
      })

      it('replays the active scan query (showEmpty: false → ARSCAN)', async () => {
        apiService.post = jest
          .fn()
          .mockResolvedValue({ status: 200, data: { keyName: mockKey } })
        const local = storeWithQuery({
          start: '5',
          end: '15',
          showEmpty: false,
        })

        await local.dispatch<any>(refreshArray(mockKey))

        const scanCall = (apiService.post as jest.Mock).mock.calls.find(
          ([url]) => url.includes('array/scan'),
        )
        expect(scanCall?.[1]).toEqual({
          keyName: mockKey,
          start: '5',
          end: '15',
          limit: 1_000_000,
        })
        expect(
          (apiService.post as jest.Mock).mock.calls.find(([url]) =>
            url.includes('array/get-range'),
          ),
        ).toBeUndefined()
      })

      it('replays the last AROP (recompute) when an aggregate result exists', async () => {
        apiService.post = jest
          .fn()
          .mockResolvedValue({ status: 200, data: { keyName: mockKey } })
        const local = mockStore({
          ...initialStateDefault,
          browser: {
            ...initialStateDefault.browser,
            array: {
              ...initialState,
              aggregate: {
                ...initialState.aggregate,
                hasResult: true,
                result: '42',
                query: {
                  start: '5',
                  end: '15',
                  operation: ArrayAggregateOperation.Match,
                  value: 'needle',
                },
              },
            },
          },
        })

        await local.dispatch<any>(refreshArray(mockKey))

        const aggregateCall = (apiService.post as jest.Mock).mock.calls.find(
          ([url]) => url.includes('array/aggregate'),
        )
        expect(aggregateCall?.[1]).toEqual({
          keyName: mockKey,
          start: '5',
          end: '15',
          operation: ArrayAggregateOperation.Match,
          value: 'needle',
        })
      })

      it('does not replay AROP when no aggregate has been run', async () => {
        apiService.post = jest
          .fn()
          .mockResolvedValue({ status: 200, data: { keyName: mockKey } })
        const local = storeWithQuery({ start: '0', end: '9', showEmpty: true })

        await local.dispatch<any>(refreshArray(mockKey))

        expect(
          (apiService.post as jest.Mock).mock.calls.find(([url]) =>
            url.includes('array/aggregate'),
          ),
        ).toBeUndefined()
      })

      it('replays the recorded search query (predicates + options) on refresh', async () => {
        apiService.post = jest.fn().mockResolvedValue({
          status: 200,
          data: { keyName: mockKey, elements: [] },
        })
        const predicates = arrayGrepPredicateFactory.buildList(2)
        const query = {
          predicates,
          combinator: ArrayCombinator.And,
          nocase: true,
          limit: 250,
        }
        const local = mockStore({
          ...initialStateDefault,
          browser: {
            ...initialStateDefault.browser,
            array: {
              ...initialState,
              search: { ...initialState.search, loaded: true, query },
            },
          },
        })

        await local.dispatch<any>(refreshArray(mockKey))

        const searchCall = (apiService.post as jest.Mock).mock.calls.find(
          ([url]) => url.includes('array/search'),
        )
        expect(searchCall?.[1]).toEqual({
          keyName: mockKey,
          predicates,
          combinator: ArrayCombinator.And,
          nocase: true,
          limit: 250,
        })
      })

      it('does not replay a search on refresh when none has run', async () => {
        apiService.post = jest
          .fn()
          .mockResolvedValue({ status: 200, data: { keyName: mockKey } })
        const local = storeWithQuery({ start: '0', end: '9', showEmpty: true })

        await local.dispatch<any>(refreshArray(mockKey))

        expect(
          (apiService.post as jest.Mock).mock.calls.find(([url]) =>
            url.includes('array/search'),
          ),
        ).toBeUndefined()
      })
    })

    describe('fetchArrayLength', () => {
      it('dispatches loadArrayLengthSuccess on 200', async () => {
        const response = {
          status: 200,
          data: { keyName: mockKey, length: '6' },
        }
        apiService.post = jest.fn().mockResolvedValue(response)

        await store.dispatch<any>(fetchArrayLength(mockKey))

        expect(store.getActions()).toEqual([
          loadArrayLengthSuccess(response.data),
        ])
      })
    })

    describe('fetchArrayCount', () => {
      it('dispatches loadArrayCountSuccess on 200', async () => {
        const response = {
          status: 200,
          data: { keyName: mockKey, count: '3' },
        }
        apiService.post = jest.fn().mockResolvedValue(response)

        await store.dispatch<any>(fetchArrayCount(mockKey))

        expect(store.getActions()).toEqual([
          loadArrayCountSuccess(response.data),
        ])
      })
    })

    describe('updateArrayElementAction', () => {
      // The optimistic patch only applies when the edited key is still the
      // selected one, so these tests run against a store whose selected key
      // matches `mockKey`.
      const storeWithSelectedKey = (name: string) => {
        const state = cloneDeep(initialStateDefault)
        state.browser.keys.selectedKey.data = { name } as any
        const s = mockStore(state)
        s.clearActions()
        return s
      }

      it('posts keyName/index/value and optimistically updates the element', async () => {
        apiService.post = jest.fn().mockResolvedValue({ status: 200, data: '' })
        const keyedStore = storeWithSelectedKey(mockKey)

        await keyedStore.dispatch<any>(
          updateArrayElementAction({ key: mockKey, index: '5', value: 'B' }),
        )

        const [url, body] = (apiService.post as jest.Mock).mock.calls[0]
        expect(url).toContain('array/set-element')
        expect(body).toEqual({ keyName: mockKey, index: '5', value: 'B' })
        expect(keyedStore.getActions()).toEqual([
          setArrayUpdating(true),
          updateArrayElement({ index: '5', value: 'B' }),
          updateSelectedKeyRefreshTime(MOCK_TIMESTAMP),
          setArrayUpdating(false),
        ])
      })

      it('skips the optimistic patch when the selected key changed mid-write', async () => {
        apiService.post = jest.fn().mockResolvedValue({ status: 200, data: '' })
        // User switched to another key before the POST resolved.
        const keyedStore = storeWithSelectedKey('another-key')
        const onSuccess = jest.fn()

        await keyedStore.dispatch<any>(
          updateArrayElementAction(
            { key: mockKey, index: '5', value: 'B' },
            onSuccess,
          ),
        )

        // No table patch / refresh-time for the now-current key; the write
        // still succeeded so onSuccess (editor close) is honoured.
        expect(keyedStore.getActions()).toEqual([
          setArrayUpdating(true),
          setArrayUpdating(false),
        ])
        expect(onSuccess).toHaveBeenCalled()
      })

      it('calls onSuccessAction on success', async () => {
        apiService.post = jest.fn().mockResolvedValue({ status: 200, data: '' })
        const keyedStore = storeWithSelectedKey(mockKey)
        const onSuccess = jest.fn()

        await keyedStore.dispatch<any>(
          updateArrayElementAction(
            { key: mockKey, index: '5', value: 'B' },
            onSuccess,
          ),
        )

        expect(onSuccess).toHaveBeenCalled()
      })

      it('notifies and calls onFailAction on error without touching the table', async () => {
        const rejected = {
          response: { status: 500, data: { message: 'boom' } },
        }
        apiService.post = jest.fn().mockRejectedValue(rejected)
        const onFail = jest.fn()

        await store.dispatch<any>(
          updateArrayElementAction(
            { key: mockKey, index: '5', value: 'B' },
            undefined,
            onFail,
          ),
        )

        expect(onFail).toHaveBeenCalled()
        expect(store.getActions()).toEqual([
          setArrayUpdating(true),
          addErrorNotification(rejected as IAddInstanceErrorPayload),
          setArrayUpdating(false),
        ])
      })
    })

    describe('searchArray', () => {
      const predicates = arrayGrepPredicateFactory.buildList(1)

      afterEach(() => abortArraySearch())

      it('posts keyName + predicates and dispatches success', async () => {
        const response = {
          status: 200,
          data: {
            keyName: mockKey,
            elements: [{ index: '0', value: 'redis' }],
          },
        }
        apiService.post = jest.fn().mockResolvedValue(response)

        await store.dispatch<any>(searchArray({ key: mockKey, predicates }))

        const [url, body] = (apiService.post as jest.Mock).mock.calls[0]
        expect(url).toContain('array/search')
        // WITHVALUES is intentionally omitted so the API default (true)
        // applies; no LIMIT is sent, so the server returns every match.
        expect(body).toEqual({
          keyName: mockKey,
          predicates,
        })
        expect(store.getActions()).toEqual([
          loadArraySearch({ predicates }),
          loadArraySearchSuccess(response.data),
        ])
      })

      it('sends options + the global connective (only with 2+ predicates)', async () => {
        apiService.post = jest.fn().mockResolvedValue({
          status: 200,
          data: { keyName: mockKey, elements: [] },
        })
        const twoPredicates = arrayGrepPredicateFactory.buildList(2)

        await store.dispatch<any>(
          searchArray({
            key: mockKey,
            predicates: twoPredicates,
            combinator: ArrayCombinator.And,
            start: '5',
            end: '15',
            nocase: true,
            withValues: false,
            limit: 50,
          }),
        )

        const [, body] = (apiService.post as jest.Mock).mock.calls[0]
        expect(body).toEqual({
          keyName: mockKey,
          predicates: twoPredicates,
          combinator: ArrayCombinator.And,
          start: '5',
          end: '15',
          nocase: true,
          withValues: false,
          limit: 50,
        })
      })

      it('omits the connective with a single predicate, blank bounds, and default WITHVALUES', async () => {
        apiService.post = jest.fn().mockResolvedValue({
          status: 200,
          data: { keyName: mockKey, elements: [] },
        })

        await store.dispatch<any>(
          searchArray({
            key: mockKey,
            predicates,
            combinator: ArrayCombinator.Or,
            start: '',
            end: '',
            nocase: false,
            withValues: true,
          }),
        )

        const [, body] = (apiService.post as jest.Mock).mock.calls[0]
        // Single predicate → no connective; blank bounds dropped (server
        // applies -/+); nocase/withValues at defaults are not sent; no LIMIT
        // (uncapped).
        expect(body).toEqual({
          keyName: mockKey,
          predicates,
        })
      })

      it('dispatches failure + notification on error', async () => {
        const rejected = {
          response: { status: 500, data: { message: 'boom' } },
        }
        apiService.post = jest.fn().mockRejectedValue(rejected)

        await store.dispatch<any>(searchArray({ key: mockKey, predicates }))

        expect(store.getActions()).toEqual([
          loadArraySearch({ predicates }),
          addErrorNotification(rejected as IAddInstanceErrorPayload),
          loadArraySearchFailure('boom'),
        ])
      })

      it('dispatches failure when the response resolves with a non-success status', async () => {
        apiService.post = jest
          .fn()
          .mockResolvedValue({ status: 304, data: null })

        await store.dispatch<any>(searchArray({ key: mockKey, predicates }))

        expect(store.getActions()).toEqual([
          loadArraySearch({ predicates }),
          loadArraySearchFailure(DEFAULT_ERROR_MESSAGE),
        ])
      })

      it('passes an AbortSignal and stays silent once aborted', async () => {
        apiService.post = jest.fn().mockImplementation(
          (_url, _body, config) =>
            new Promise((_resolve, reject) => {
              config?.signal?.addEventListener('abort', () => {
                reject(new axios.Cancel('aborted by client'))
              })
            }),
        )

        const dispatchPromise = store.dispatch<any>(
          searchArray({ key: mockKey, predicates }),
        )
        abortArraySearch()
        await dispatchPromise

        const [, , config] = (apiService.post as jest.Mock).mock.calls[0]
        expect(config?.signal).toBeInstanceOf(AbortSignal)
        expect(store.getActions()).toEqual([loadArraySearch({ predicates })])
      })
    })
  })
})
