import { faker } from '@faker-js/faker'
import { cloneDeep } from 'lodash'

import { apiService } from 'uiSrc/services'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
  mockStore,
} from 'uiSrc/utils/test-utils'
import {
  addErrorNotification,
  IAddInstanceErrorPayload,
} from 'uiSrc/slices/app/notifications'
import { MOCK_TIMESTAMP } from 'uiSrc/mocks/data/dateNow'
import {
  arrayElementFactory,
  arrayTestKeyName,
  addArrayElementsDataFactory,
} from 'uiSrc/mocks/factories/browser/array/arrayElement.factory'
import {
  deleteSelectedKeySuccess,
  updateSelectedKeyRefreshTime,
} from '../../browser/keys'
import reducer, {
  initialState,
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
  arraySelector,
  arrayDataSelector,
  addArrayElementsStateSelector,
  fetchArrayElements,
  fetchMoreArrayElements,
  deleteArrayElements,
  addArrayElements,
} from '../../browser/array'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
}))

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

  describe('reducer, actions and selectors', () => {
    it('should return the initial state on first run', () => {
      const result = reducer(undefined, {} as any)
      expect(result).toEqual(initialState)
    })
  })

  // ─── loadArrayElements ────────────────────────────────────────────────────

  describe('loadArrayElements', () => {
    it('should set loading=true and reset data when resetData=true', () => {
      const nextState = reducer(initialState, loadArrayElements(true))
      const rootState = {
        ...initialStateDefault,
        browser: { ...initialStateDefault.browser, array: nextState },
      }
      expect(arraySelector(rootState)).toEqual({
        ...initialState,
        loading: true,
        error: '',
      })
    })

    it('should set loading=true without resetting data when resetData=false', () => {
      const stateWithData = {
        ...initialState,
        data: {
          ...initialState.data,
          total: 5,
          elements: arrayElementFactory.buildList(2),
        },
      }
      const nextState = reducer(stateWithData, loadArrayElements(false))
      const rootState = {
        ...initialStateDefault,
        browser: { ...initialStateDefault.browser, array: nextState },
      }
      const result = arraySelector(rootState)
      expect(result.loading).toBe(true)
      expect(result.data.total).toBe(5)
    })
  })

  // ─── loadArrayElementsSuccess ─────────────────────────────────────────────

  describe('loadArrayElementsSuccess', () => {
    it('should properly set the state with fetched data', () => {
      const elements = arrayElementFactory.buildList(3)
      const keyName = arrayTestKeyName()
      const data = {
        keyName,
        total: elements.length,
        logicalLength: elements.length,
        nextCursor: undefined,
        elements,
      }

      const nextState = reducer(initialState, loadArrayElementsSuccess(data))
      const rootState = {
        ...initialStateDefault,
        browser: { ...initialStateDefault.browser, array: nextState },
      }
      expect(arraySelector(rootState)).toEqual({
        ...initialState,
        loading: false,
        data,
      })
    })
  })

  // ─── loadArrayElementsFailure ─────────────────────────────────────────────

  describe('loadArrayElementsFailure', () => {
    it('should properly set error in state', () => {
      const error = faker.lorem.sentence()
      const nextState = reducer(initialState, loadArrayElementsFailure(error))
      const rootState = {
        ...initialStateDefault,
        browser: { ...initialStateDefault.browser, array: nextState },
      }
      expect(arraySelector(rootState)).toEqual({
        ...initialState,
        loading: false,
        error,
      })
    })
  })

  // ─── loadMoreArrayElements ────────────────────────────────────────────────

  describe('loadMoreArrayElements / loadMoreArrayElementsSuccess', () => {
    it('should set loading=true on loadMoreArrayElements', () => {
      const nextState = reducer(initialState, loadMoreArrayElements())
      const rootState = {
        ...initialStateDefault,
        browser: { ...initialStateDefault.browser, array: nextState },
      }
      expect(arraySelector(rootState).loading).toBe(true)
    })

    it('should append elements on loadMoreArrayElementsSuccess', () => {
      const existingElements = arrayElementFactory.buildList(2)
      const newElements = arrayElementFactory.buildList(2)
      const stateWithElements = {
        ...initialState,
        loading: true,
        data: { ...initialState.data, elements: existingElements, total: 4 },
      }

      const nextState = reducer(
        stateWithElements,
        loadMoreArrayElementsSuccess({
          keyName: arrayTestKeyName(),
          total: 4,
          logicalLength: 4,
          elements: newElements,
          nextCursor: undefined,
        }),
      )
      expect(nextState.data.elements).toHaveLength(4)
      expect(nextState.loading).toBe(false)
    })
  })

  // ─── loadMoreArrayElementsFailure ─────────────────────────────────────────

  describe('loadMoreArrayElementsFailure', () => {
    it('should set error', () => {
      const error = faker.lorem.sentence()
      const nextState = reducer(
        { ...initialState, loading: true },
        loadMoreArrayElementsFailure(error),
      )
      expect(nextState.loading).toBe(false)
      expect(nextState.error).toBe(error)
    })
  })

  // ─── removeIndicesFromList ────────────────────────────────────────────────

  describe('removeIndicesFromList', () => {
    it('should remove specified indices and decrement total', () => {
      const elements = arrayElementFactory.buildList(3)
      const stateWithElements = {
        ...initialState,
        data: { ...initialState.data, elements, total: 3 },
      }

      // Use actual indices from built elements rather than hardcoded 0
      const indexToRemove = elements[0].index
      const nextState = reducer(
        stateWithElements,
        removeIndicesFromList([indexToRemove]),
      )
      expect(nextState.data.elements).toHaveLength(2)
      expect(nextState.data.total).toBe(2)
      expect(
        nextState.data.elements.find((e) => e.index === indexToRemove),
      ).toBeUndefined()
    })
  })

  // ─── adding sub-state ─────────────────────────────────────────────────────

  describe('addElements / addElementsSuccess / addElementsFailure', () => {
    it('should set adding.loading=true on addElements', () => {
      const nextState = reducer(initialState, addElements())
      expect(nextState.adding.loading).toBe(true)
      expect(nextState.adding.error).toBe('')
    })

    it('should set adding.loading=false on addElementsSuccess', () => {
      const loadingState = reducer(initialState, addElements())
      const nextState = reducer(loadingState, addElementsSuccess())
      expect(nextState.adding.loading).toBe(false)
    })

    it('should set adding.error on addElementsFailure', () => {
      const error = faker.lorem.sentence()
      const nextState = reducer(initialState, addElementsFailure(error))
      expect(nextState.adding.loading).toBe(false)
      expect(nextState.adding.error).toBe(error)
    })
  })

  // ─── selectors ────────────────────────────────────────────────────────────

  describe('selectors', () => {
    it('arrayDataSelector should return data slice', () => {
      const elements = arrayElementFactory.buildList(2)
      const data = {
        ...initialState.data,
        total: 2,
        elements,
      }
      const stateWithData = { ...initialState, data }
      const rootState = {
        ...initialStateDefault,
        browser: { ...initialStateDefault.browser, array: stateWithData },
      }
      expect(arrayDataSelector(rootState)).toEqual(data)
    })

    it('addArrayElementsStateSelector should return adding slice', () => {
      const rootState = {
        ...initialStateDefault,
        browser: { ...initialStateDefault.browser, array: initialState },
      }
      expect(addArrayElementsStateSelector(rootState)).toEqual(
        initialState.adding,
      )
    })
  })

  // ─── thunks ───────────────────────────────────────────────────────────────

  describe('thunks', () => {
    describe('fetchArrayElements', () => {
      const elements = arrayElementFactory.buildList(3)
      const keyName = arrayTestKeyName()
      const apiResponse = {
        keyName,
        total: elements.length,
        logicalLength: elements.length,
        elements,
        nextCursor: undefined,
      }

      it('dispatches loadArrayElementsSuccess when fetch is successful', async () => {
        const responsePayload = { data: apiResponse, status: 200 }
        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        await store.dispatch<any>(fetchArrayElements({ key: keyName as any }))

        const expectedActions = [
          loadArrayElements(undefined),
          loadArrayElementsSuccess(apiResponse),
          updateSelectedKeyRefreshTime(MOCK_TIMESTAMP),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('dispatches loadArrayElementsFailure when fetch fails', async () => {
        const errorMessage = 'Something went wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }
        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        await store.dispatch<any>(fetchArrayElements({ key: keyName as any }))

        const expectedActions = [
          loadArrayElements(undefined),
          addErrorNotification(responsePayload as IAddInstanceErrorPayload),
          loadArrayElementsFailure(errorMessage),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchMoreArrayElements', () => {
      const moreElements = arrayElementFactory.buildList(2)
      const keyName = arrayTestKeyName()
      const moreApiResponse = {
        keyName,
        total: faker.number.int({ min: moreElements.length + 1, max: 50 }),
        logicalLength: faker.number.int({
          min: moreElements.length + 1,
          max: 50,
        }),
        elements: moreElements,
        nextCursor: undefined,
      }

      it('dispatches loadMoreVectorSetElementsSuccess when fetch is successful', async () => {
        const responsePayload = { data: moreApiResponse, status: 200 }
        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        await store.dispatch<any>(
          fetchMoreArrayElements({
            key: keyName as any,
            cursor: faker.number.int({ min: 1, max: 100 }),
          }),
        )

        const expectedActions = [
          loadMoreArrayElements(),
          loadMoreArrayElementsSuccess(moreApiResponse),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('dispatches loadMoreArrayElementsFailure when fetch fails', async () => {
        const errorMessage = 'Fetch more failed!'
        const responsePayload = {
          response: { status: 500, data: { message: errorMessage } },
        }
        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        await store.dispatch<any>(
          fetchMoreArrayElements({ key: keyName as any, cursor: 1 }),
        )

        const expectedActions = [
          loadMoreArrayElements(),
          addErrorNotification(responsePayload as IAddInstanceErrorPayload),
          loadMoreArrayElementsFailure(errorMessage),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('deleteArrayElements', () => {
      const keyName = arrayTestKeyName()
      const indicesToDelete = [0, 1]

      it('dispatches removeArrayElementsSuccess and refreshes key info when elements remain', async () => {
        const storeWithArray = mockStore({
          ...initialStateDefault,
          browser: {
            ...initialStateDefault.browser,
            array: {
              ...initialState,
              data: { ...initialState.data, total: 5 },
            },
          },
        })
        const responsePayload = {
          data: { affected: indicesToDelete.length },
          status: 200,
        }
        apiService.delete = jest.fn().mockResolvedValue(responsePayload)
        const onSuccess = jest.fn()

        await storeWithArray.dispatch<any>(
          deleteArrayElements(keyName as any, indicesToDelete, onSuccess),
        )

        expect(onSuccess).toHaveBeenCalledWith(3)
        const actions = storeWithArray.getActions()
        expect(actions).toContainEqual(removeArrayElements())
        expect(actions).toContainEqual(removeArrayElementsSuccess())
        expect(actions).toContainEqual(removeIndicesFromList(indicesToDelete))
      })

      it('dispatches deleteSelectedKeySuccess when last elements are removed', async () => {
        const storeWithArray = mockStore({
          ...initialStateDefault,
          browser: {
            ...initialStateDefault.browser,
            array: {
              ...initialState,
              data: { ...initialState.data, total: 2 },
            },
          },
        })
        const responsePayload = { data: { affected: 2 }, status: 200 }
        apiService.delete = jest.fn().mockResolvedValue(responsePayload)

        await storeWithArray.dispatch<any>(
          deleteArrayElements(keyName as any, [0, 1]),
        )

        const actions = storeWithArray.getActions()
        expect(actions).toContainEqual(deleteSelectedKeySuccess())
      })

      it('dispatches removeArrayElementsFailure when delete fails', async () => {
        const errorMessage = 'Delete failed!'
        const responsePayload = {
          response: { status: 500, data: { message: errorMessage } },
        }
        apiService.delete = jest.fn().mockRejectedValue(responsePayload)

        await store.dispatch<any>(
          deleteArrayElements(keyName as any, indicesToDelete),
        )

        const expectedActions = [
          removeArrayElements(),
          addErrorNotification(responsePayload as IAddInstanceErrorPayload),
          removeArrayElementsFailure(errorMessage),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('addArrayElements', () => {
      const addData = addArrayElementsDataFactory.build()

      it('dispatches addElementsSuccess and triggers refetch when successful', async () => {
        // First PUT succeeds, subsequent POST (refetch) succeeds
        apiService.put = jest.fn().mockResolvedValue({ status: 200 })
        apiService.post = jest.fn().mockResolvedValue({
          status: 200,
          data: {
            keyName: addData.keyName,
            total: 1,
            logicalLength: 1,
            elements: [],
            nextCursor: undefined,
          },
        })

        const onSuccess = jest.fn()
        await store.dispatch<any>(addArrayElements(addData, onSuccess))

        expect(onSuccess).toHaveBeenCalledTimes(1)
        const actions = store.getActions()
        expect(actions).toContainEqual(addElements())
        expect(actions).toContainEqual(addElementsSuccess())
      })

      it('dispatches addElementsFailure when PUT fails', async () => {
        const errorMessage = 'PUT failed!'
        const responsePayload = {
          response: { status: 500, data: { message: errorMessage } },
        }
        apiService.put = jest.fn().mockRejectedValue(responsePayload)

        const onFail = jest.fn()
        await store.dispatch<any>(addArrayElements(addData, undefined, onFail))

        expect(onFail).toHaveBeenCalledTimes(1)
        const actions = store.getActions()
        expect(actions).toContainEqual(addElements())
        expect(actions).toContainEqual(
          addErrorNotification(responsePayload as IAddInstanceErrorPayload),
        )
        expect(actions).toContainEqual(addElementsFailure(errorMessage))
      })
    })
  })
})
