import axios from 'axios'
import { cloneDeep } from 'lodash'
import { apiService } from 'uiSrc/services'
import { DEFAULT_ERROR_MESSAGE, stringToBuffer } from 'uiSrc/utils'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
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
  clearArrayAggregate,
  loadArrayAggregateSuccess,
  aggregateArray,
  abortArrayAggregate,
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
  fetchArrayNeighbours,
  deleteArrayElements,
} from '../../browser/array'
import { arrayGrepPredicateFactory } from 'uiSrc/mocks/factories/browser/array/arrayGrepPredicate.factory'
import {
  refreshKeyInfo,
  updateSelectedKeyRefreshTime,
  deleteSelectedKeySuccess,
} from '../../browser/keys'
import {
  addErrorNotification,
  addMessageNotification,
} from '../../app/notifications'
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
      const storeWithSelectedKey = (name: unknown) => {
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
        const actions = keyedStore.getActions()
        expect(actions).toContainEqual(setArrayUpdating(true))
        expect(actions).toContainEqual(
          updateArrayElement({ index: '5', value: 'B' }),
        )
        expect(actions).toContainEqual(clearArrayAggregate())
        // Refetch key info (not just stamp the time) so the header Key Size
        // reflects a value edited to a different byte length.
        expect(actions).toContainEqual(refreshKeyInfo())
        expect(actions).toContainEqual(setArrayUpdating(false))
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

      it('only the latest ARSET clears the update lock when two overlap', async () => {
        const keyedStore = storeWithSelectedKey(mockKey)
        let resolveFirst: () => void = () => {}
        let resolveSecond: () => void = () => {}
        apiService.post = jest
          .fn()
          .mockImplementationOnce(
            () =>
              new Promise((r) => {
                resolveFirst = () => r({ status: 200, data: '' })
              }),
          )
          .mockImplementationOnce(
            () =>
              new Promise((r) => {
                resolveSecond = () => r({ status: 200, data: '' })
              }),
          )

        const first = keyedStore.dispatch<any>(
          updateArrayElementAction({ key: mockKey, index: '1', value: 'a' }),
        )
        const second = keyedStore.dispatch<any>(
          updateArrayElementAction({ key: mockKey, index: '2', value: 'b' }),
        )

        const isSetUpdatingFalse = (a: { type: string; payload?: unknown }) =>
          a.type === setArrayUpdating(false).type && a.payload === false

        // The stale first completion must NOT release the lock — a second
        // ARSET is still pending.
        resolveFirst()
        await first
        expect(keyedStore.getActions().filter(isSetUpdatingFalse)).toHaveLength(
          0,
        )

        // The latest one clears it.
        resolveSecond()
        await second
        expect(keyedStore.getActions().filter(isSetUpdatingFalse)).toHaveLength(
          1,
        )
      })

      it('still patches when the selected key is the same bytes but a new buffer instance', async () => {
        apiService.post = jest.fn().mockResolvedValue({ status: 200, data: '' })
        // Redux can replace the name buffer with a fresh instance for the same
        // key (e.g. a key-info refetch) while the POST is in flight.
        const keyedStore = storeWithSelectedKey(stringToBuffer('readings'))

        await keyedStore.dispatch<any>(
          updateArrayElementAction({
            key: stringToBuffer('readings'),
            index: '5',
            value: 'B',
          }),
        )

        expect(keyedStore.getActions()).toContainEqual(
          updateArrayElement({ index: '5', value: 'B' }),
        )
      })

      it('aborts an in-flight aggregate so a stale AROP cannot repopulate after the edit', async () => {
        const keyedStore = storeWithSelectedKey(mockKey)
        let resolveAgg: () => void = () => {}
        apiService.post = jest
          .fn()
          .mockImplementationOnce(
            () =>
              new Promise((r) => {
                resolveAgg = () =>
                  r({
                    status: 200,
                    data: { keyName: mockKey, result: '104.7' },
                  })
              }),
          )
          .mockResolvedValue({ status: 200, data: '' })

        // AROP in flight, then an edit lands and clears + aborts it.
        const aggregate = keyedStore.dispatch<any>(
          aggregateArray({
            key: mockKey,
            start: '0',
            end: '6',
            operation: ArrayAggregateOperation.Sum,
          }),
        )
        await keyedStore.dispatch<any>(
          updateArrayElementAction({ key: mockKey, index: '1', value: 'x' }),
        )

        // The stale aggregate response resolves after the edit.
        resolveAgg()
        await aggregate

        // It must not repopulate the (cleared) aggregate state.
        const types = keyedStore.getActions().map((a) => a.type)
        expect(types).not.toContain(loadArrayAggregateSuccess.type)
        abortArrayAggregate()
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

    describe('fetchArrayNeighbours', () => {
      it('resolves normalized elements without dispatching slice actions', async () => {
        const data = { keyName: mockKey, elements: ['a', null, 'c'] }
        apiService.post = jest.fn().mockResolvedValue({ status: 200, data })

        const result = await store.dispatch<any>(
          fetchArrayNeighbours({ key: mockKey, start: '37', end: '39' }),
        )

        expect(result).toEqual([
          { index: '37', value: 'a' },
          { index: '38', value: null },
          { index: '39', value: 'c' },
        ])
        // Writes nothing into the shared View-tab slice.
        expect(store.getActions()).toEqual([])
      })

      it('sends the clamped range and the abort signal', async () => {
        apiService.post = jest.fn().mockResolvedValue({
          status: 200,
          data: { keyName: mockKey, elements: [] },
        })
        const controller = new AbortController()

        await store.dispatch<any>(
          fetchArrayNeighbours(
            { key: mockKey, start: '0', end: '5' },
            controller.signal,
          ),
        )

        const [, body, config] = (apiService.post as jest.Mock).mock.calls[0]
        expect(body).toEqual({ keyName: mockKey, start: '0', end: '5' })
        expect(config.signal).toBe(controller.signal)
      })

      it('throws on a non-success status', async () => {
        apiService.post = jest
          .fn()
          .mockResolvedValue({ status: 304, data: null })

        await expect(
          store.dispatch<any>(
            fetchArrayNeighbours({ key: mockKey, start: '0', end: '5' }),
          ),
        ).rejects.toThrow(DEFAULT_ERROR_MESSAGE)
      })
    })

    describe('deleteArrayElements', () => {
      // Array keys are binary; the guard compares them by bytes, so drive the
      // tests with buffers. The thunk only touches the UI once it confirms the
      // deleted key is still the selected one. The guard reads the app-context
      // selection (updated synchronously on key click), not `selectedKey.data`
      // (which lags a key switch while the new info loads), so seed that.
      const keyBuffer = stringToBuffer(mockKey)
      const storeWithSelectedKey = (
        selected: RedisResponseBuffer = keyBuffer,
      ) => {
        const state = cloneDeep(initialStateDefault)
        state.app.context.browser.keyList.selectedKey = selected
        const next = mockStore(state)
        next.clearActions()
        return next
      }

      beforeEach(() => {
        store = storeWithSelectedKey()
      })

      it('deletes by index, refreshes every loaded view, and toasts when the key survives', async () => {
        apiService.delete = jest
          .fn()
          .mockResolvedValue({ status: 200, data: { affected: '1' } })
        // ARCOUNT probe (key still exists) + refreshArray's follow-up fetches.
        apiService.post = jest.fn().mockResolvedValue({
          status: 200,
          data: { keyName: mockKey, count: '4' },
        })

        await store.dispatch<any>(deleteArrayElements(keyBuffer, ['2']))

        expect(apiService.delete).toHaveBeenCalledWith(
          expect.stringContaining('array/elements'),
          expect.objectContaining({
            data: { keyName: keyBuffer, indexes: ['2'] },
          }),
        )
        const actions = store.getActions()
        // refreshArray replays the View range, so the loaded views update.
        expect(actions.some((a) => a.type === loadArrayRangeSuccess.type)).toBe(
          true,
        )
        expect(
          actions.some((a) => a.type === addMessageNotification.type),
        ).toBe(true)
        // Survived ⇒ not treated as a deleted key, no error.
        expect(
          actions.some((a) => a.type === deleteSelectedKeySuccess.type),
        ).toBe(false)
        expect(actions.some((a) => a.type === addErrorNotification.type)).toBe(
          false,
        )
      })

      it('treats a 404 on the ARCOUNT probe as a deleted key (last element)', async () => {
        apiService.delete = jest
          .fn()
          .mockResolvedValue({ status: 200, data: { affected: '1' } })
        apiService.post = jest
          .fn()
          .mockRejectedValue({ response: { status: 404 } })

        await store.dispatch<any>(deleteArrayElements(keyBuffer, ['0']))

        const actions = store.getActions()
        expect(
          actions.some((a) => a.type === deleteSelectedKeySuccess.type),
        ).toBe(true)
        expect(actions.some((a) => a.type === addErrorNotification.type)).toBe(
          false,
        )
      })

      it('still refreshes (not masks the delete) when the ARCOUNT probe fails non-404', async () => {
        apiService.delete = jest
          .fn()
          .mockResolvedValue({ status: 200, data: { affected: '1' } })
        // First POST is the ARCOUNT probe (fails with a non-404); the rest are
        // refreshArray's follow-up fetches and succeed.
        apiService.post = jest
          .fn()
          .mockRejectedValueOnce({ response: { status: 500 } })
          .mockResolvedValue({ status: 200, data: { keyName: mockKey } })

        await store.dispatch<any>(deleteArrayElements(keyBuffer, ['2']))

        const actions = store.getActions()
        // The succeeded delete is acknowledged and the views refreshed — not
        // reported as a failure, and not mistaken for a deleted key.
        expect(actions.some((a) => a.type === loadArrayRangeSuccess.type)).toBe(
          true,
        )
        expect(
          actions.some((a) => a.type === addMessageNotification.type),
        ).toBe(true)
        expect(
          actions.some((a) => a.type === deleteSelectedKeySuccess.type),
        ).toBe(false)
        expect(actions.some((a) => a.type === addErrorNotification.type)).toBe(
          false,
        )
      })

      it('shows an error notification when the delete itself fails', async () => {
        const rejected = {
          response: { status: 500, data: { message: 'boom' } },
        }
        apiService.delete = jest.fn().mockRejectedValue(rejected)

        await store.dispatch<any>(deleteArrayElements(keyBuffer, ['1']))

        expect(store.getActions()).toContainEqual(
          addErrorNotification(rejected as IAddInstanceErrorPayload),
        )
      })

      it('skips the UI updates when the selected key changed mid-flight', async () => {
        // User switched to another key before the round-trip finished — the
        // delete still applied server-side, but the shared slice/header now
        // belong to the new key and must not be clobbered.
        store = storeWithSelectedKey(stringToBuffer('another-key'))
        apiService.delete = jest
          .fn()
          .mockResolvedValue({ status: 200, data: { affected: '1' } })
        apiService.post = jest.fn().mockResolvedValue({
          status: 200,
          data: { keyName: mockKey, count: '4' },
        })

        await store.dispatch<any>(deleteArrayElements(keyBuffer, ['2']))

        // The delete was issued, but none of the current key's view is touched.
        expect(apiService.delete).toHaveBeenCalled()
        const actions = store.getActions()
        expect(actions.some((a) => a.type === loadArrayRangeSuccess.type)).toBe(
          false,
        )
        expect(
          actions.some((a) => a.type === addMessageNotification.type),
        ).toBe(false)
        expect(
          actions.some((a) => a.type === deleteSelectedKeySuccess.type),
        ).toBe(false)
      })

      it('refreshes using the live selection while selectedKey.data still lags on the old key', async () => {
        // Mid key-switch the details reducer keeps the previous `data` in place
        // until the new key info loads. The user is still on the deleted-from
        // key in app context, so the guard must refresh — reading the stale
        // `selectedKey.data.name` would wrongly bail and leave the view stale.
        const state = cloneDeep(initialStateDefault)
        state.app.context.browser.keyList.selectedKey = keyBuffer
        ;(state.browser.keys.selectedKey as any).data = {
          name: stringToBuffer('stale-loading-key'),
        }
        store = mockStore(state)
        store.clearActions()
        apiService.delete = jest
          .fn()
          .mockResolvedValue({ status: 200, data: { affected: '1' } })
        apiService.post = jest.fn().mockResolvedValue({
          status: 200,
          data: { keyName: mockKey, count: '4' },
        })

        await store.dispatch<any>(deleteArrayElements(keyBuffer, ['2']))

        const actions = store.getActions()
        expect(actions.some((a) => a.type === loadArrayRangeSuccess.type)).toBe(
          true,
        )
        expect(
          actions.some((a) => a.type === addMessageNotification.type),
        ).toBe(true)
      })

      it('bails byte-safely when a different binary key decodes to the same string', async () => {
        // Two distinct binary keys whose invalid UTF-8 both render as the
        // replacement char — a string compare would wrongly match them.
        const deletedKey = {
          type: 'Buffer',
          data: [0xff],
        } as RedisResponseBuffer
        const currentKey = {
          type: 'Buffer',
          data: [0xfe],
        } as RedisResponseBuffer
        store = storeWithSelectedKey(currentKey)
        apiService.delete = jest
          .fn()
          .mockResolvedValue({ status: 200, data: { affected: '1' } })
        apiService.post = jest.fn().mockResolvedValue({
          status: 200,
          data: { keyName: mockKey, count: '4' },
        })

        await store.dispatch<any>(deleteArrayElements(deletedKey, ['0']))

        const actions = store.getActions()
        expect(actions.some((a) => a.type === loadArrayRangeSuccess.type)).toBe(
          false,
        )
        expect(
          actions.some((a) => a.type === deleteSelectedKeySuccess.type),
        ).toBe(false)
      })
    })
  })
})
