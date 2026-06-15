import { cloneDeep } from 'lodash'
import { apiService } from 'uiSrc/services'
import { IAddInstanceErrorPayload } from 'uiSrc/slices/app/notifications'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
  mockStore,
} from 'uiSrc/utils/test-utils'
import { MOCK_TIMESTAMP } from 'uiSrc/mocks/data/dateNow'

import reducer, {
  initialState,
  setArrayInitialState,
  setArrayActiveQuery,
  loadArrayRange,
  loadArrayRangeSuccess,
  loadArrayRangeFailure,
  loadArrayScanSuccess,
  loadArrayLengthSuccess,
  loadArrayCountSuccess,
  loadArrayNextIndexSuccess,
  arraySelector,
  arrayDataSelector,
  fetchArrayRange,
  scanArrayRange,
  fetchArrayLength,
  fetchArrayCount,
  fetchArrayNextIndex,
  fetchArrayElement,
  fetchArrayMultiElements,
  refreshArray,
} from '../../browser/array'
import { updateSelectedKeyRefreshTime } from '../../browser/keys'
import { addErrorNotification } from '../../app/notifications'

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

    it('loadArrayNextIndexSuccess writes only nextIndex', () => {
      const next = reducer(
        initialState,
        loadArrayNextIndexSuccess({ keyName: mockKey, index: '100' }),
      )
      expect(next.data.nextIndex).toBe('100')
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
          loadArrayRangeSuccess({ start: '0', response: response.data }),
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
          scanArrayRange({ key: mockKey, start: '0', end: '10', limit: 5 }),
        )

        expect(store.getActions()).toEqual([
          loadArrayRange(undefined),
          setArrayActiveQuery({ start: '0', end: '10', showEmpty: false }),
          loadArrayScanSuccess(response.data),
          updateSelectedKeyRefreshTime(MOCK_TIMESTAMP),
        ])
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
        })
        expect(
          (apiService.post as jest.Mock).mock.calls.find(([url]) =>
            url.includes('array/get-range'),
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

    describe('fetchArrayNextIndex', () => {
      it('dispatches loadArrayNextIndexSuccess on 200', async () => {
        const response = {
          status: 200,
          data: { keyName: mockKey, index: '6' },
        }
        apiService.post = jest.fn().mockResolvedValue(response)

        await store.dispatch<any>(fetchArrayNextIndex(mockKey))

        expect(store.getActions()).toEqual([
          loadArrayNextIndexSuccess(response.data),
        ])
      })

      it('dispatches error notification on rejection', async () => {
        const rejected = {
          response: { status: 500, data: { message: 'nope' } },
        }
        apiService.post = jest.fn().mockRejectedValue(rejected)

        await store.dispatch<any>(fetchArrayNextIndex(mockKey))

        expect(store.getActions()).toEqual([
          addErrorNotification(rejected as IAddInstanceErrorPayload),
        ])
      })
    })

    describe('fetchArrayElement', () => {
      it('invokes onSuccess with the response value on 200', async () => {
        const response = {
          status: 200,
          data: { keyName: mockKey, value: '20.1' },
        }
        apiService.post = jest.fn().mockResolvedValue(response)
        const onSuccess = jest.fn()
        const onFail = jest.fn()

        await store.dispatch<any>(
          fetchArrayElement({ key: mockKey, index: '0' }, onSuccess, onFail),
        )

        expect(onSuccess).toHaveBeenCalledWith(response.data)
        expect(onFail).not.toHaveBeenCalled()
      })

      it('invokes onFail on rejection', async () => {
        apiService.post = jest.fn().mockRejectedValue({
          response: { status: 500, data: { message: 'nope' } },
        })
        const onSuccess = jest.fn()
        const onFail = jest.fn()

        await store.dispatch<any>(
          fetchArrayElement({ key: mockKey, index: '0' }, onSuccess, onFail),
        )

        expect(onSuccess).not.toHaveBeenCalled()
        expect(onFail).toHaveBeenCalled()
      })
    })

    describe('fetchArrayMultiElements', () => {
      it('invokes onSuccess with the response on 200', async () => {
        const response = {
          status: 200,
          data: { keyName: mockKey, elements: ['a', null, 'b'] },
        }
        apiService.post = jest.fn().mockResolvedValue(response)
        const onSuccess = jest.fn()

        await store.dispatch<any>(
          fetchArrayMultiElements(
            { key: mockKey, indexes: ['0', '1', '2'] },
            onSuccess,
          ),
        )

        expect(onSuccess).toHaveBeenCalledWith(response.data)
      })
    })
  })
})
