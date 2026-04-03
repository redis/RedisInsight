import { faker } from '@faker-js/faker'
import { cloneDeep } from 'lodash'
import { apiService } from 'uiSrc/services'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import {
  addErrorNotification,
  IAddInstanceErrorPayload,
} from 'uiSrc/slices/app/notifications'
import { MOCK_TIMESTAMP } from 'uiSrc/mocks/data/dateNow'
import {
  vectorSetElementFactory,
  vectorSetTestKeyName,
  vectorSetPaginationCursorAfter,
} from 'uiSrc/mocks/factories/browser/vectorSet/vectorSetElement.factory'
import { updateSelectedKeyRefreshTime } from '../../browser/keys'
import reducer, {
  initialState,
  loadVectorSetElements,
  loadVectorSetElementsSuccess,
  loadVectorSetElementsFailure,
  loadMoreVectorSetElements,
  loadMoreVectorSetElementsSuccess,
  loadMoreVectorSetElementsFailure,
  vectorSetSelector,
  fetchVectorSetElements,
  fetchMoreVectorSetElements,
} from '../../browser/vectorSet'

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

describe('vectorSet slice', () => {
  beforeAll(() => {
    dateNow = jest.spyOn(Date, 'now').mockImplementation(() => MOCK_TIMESTAMP)
  })

  afterAll(() => {
    dateNow.mockRestore()
  })

  describe('reducer, actions and selectors', () => {
    it('should return the initial state on first run', () => {
      const nextState = initialState
      const result = reducer(undefined, {} as any)

      expect(result).toEqual(nextState)
    })
  })

  describe('loadVectorSetElements', () => {
    it('should properly set the state before the fetch data', () => {
      const state = {
        ...initialState,
        loading: true,
      }

      const nextState = reducer(initialState, loadVectorSetElements(true))

      const rootState = {
        ...initialStateDefault,
        browser: { ...initialStateDefault.browser, vectorSet: nextState },
      }
      expect(vectorSetSelector(rootState)).toEqual(state)
    })
  })

  describe('loadVectorSetElementsSuccess', () => {
    it('should properly set the state with fetched data', () => {
      const elements = vectorSetElementFactory.buildList(2)
      const keyName = vectorSetTestKeyName()
      const data = {
        keyName,
        total: elements.length,
        nextCursor: vectorSetPaginationCursorAfter(
          elements[elements.length - 1],
        ),
        isPaginationSupported: true,
        elements,
      }

      const state = {
        loading: false,
        error: '',
        data: {
          ...data,
          key: data.keyName,
        },
      }

      const nextState = reducer(
        initialState,
        loadVectorSetElementsSuccess(data as any),
      )

      const rootState = {
        ...initialStateDefault,
        browser: { ...initialStateDefault.browser, vectorSet: nextState },
      }
      expect(vectorSetSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      const data: any = {
        keyName: vectorSetTestKeyName(),
      }

      const state = {
        loading: false,
        error: '',
        data: {
          ...initialState.data,
          ...data,
          key: data.keyName,
        },
      }

      const nextState = reducer(
        initialState,
        loadVectorSetElementsSuccess(data),
      )

      const rootState = {
        ...initialStateDefault,
        browser: { ...initialStateDefault.browser, vectorSet: nextState },
      }
      expect(vectorSetSelector(rootState)).toEqual(state)
    })

    it('stores isPaginationSupported true so UI hides the preview banner (table lists pages)', () => {
      const elements = vectorSetElementFactory.buildList(5)
      const keyName = vectorSetTestKeyName()
      const data = {
        keyName,
        total: elements.length,
        nextCursor: undefined,
        isPaginationSupported: true,
        elements,
      }

      const state = {
        loading: false,
        error: '',
        data: {
          ...data,
          key: data.keyName,
        },
      }

      const nextState = reducer(
        initialState,
        loadVectorSetElementsSuccess(data as any),
      )

      const rootState = {
        ...initialStateDefault,
        browser: { ...initialStateDefault.browser, vectorSet: nextState },
      }
      expect(vectorSetSelector(rootState)).toEqual(state)
      expect(nextState.data.isPaginationSupported).toBe(true)
    })

    it('stores isPaginationSupported false so UI shows the preview banner (random sample)', () => {
      const elements = vectorSetElementFactory.buildList(3)
      const keyName = vectorSetTestKeyName()
      const total = faker.number.int({ min: elements.length + 1, max: 500 })
      const data = {
        keyName,
        total,
        nextCursor: undefined,
        isPaginationSupported: false,
        elements,
      }

      const state = {
        loading: false,
        error: '',
        data: {
          ...data,
          key: data.keyName,
        },
      }

      const nextState = reducer(
        initialState,
        loadVectorSetElementsSuccess(data as any),
      )

      const rootState = {
        ...initialStateDefault,
        browser: { ...initialStateDefault.browser, vectorSet: nextState },
      }
      expect(vectorSetSelector(rootState)).toEqual(state)
      expect(nextState.data.isPaginationSupported).toBe(false)
    })
  })

  describe('loadVectorSetElementsFailure', () => {
    it('should properly set the error', () => {
      const data = 'some error'
      const state = {
        loading: false,
        error: data,
        data: initialState.data,
      }

      const nextState = reducer(
        initialState,
        loadVectorSetElementsFailure(data),
      )

      const rootState = {
        ...initialStateDefault,
        browser: { ...initialStateDefault.browser, vectorSet: nextState },
      }
      expect(vectorSetSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMoreVectorSetElements', () => {
    it('should properly set the state before the fetch data', () => {
      const state = {
        loading: true,
        error: '',
        data: initialState.data,
      }

      const nextState = reducer(initialState, loadMoreVectorSetElements())

      const rootState = {
        ...initialStateDefault,
        browser: { ...initialStateDefault.browser, vectorSet: nextState },
      }
      expect(vectorSetSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMoreVectorSetElementsSuccess', () => {
    it('should properly set the state with fetched data', () => {
      const elements = vectorSetElementFactory.buildList(2)
      const keyName = vectorSetTestKeyName()
      const data = {
        keyName,
        nextCursor: undefined,
        total: 0,
        elements,
      }

      const state = {
        loading: false,
        error: '',
        data: {
          ...initialState.data,
          keyName,
          total: 0,
          nextCursor: undefined,
          elements,
        },
      }

      const nextState = reducer(
        initialState,
        loadMoreVectorSetElementsSuccess(data as any),
      )

      const rootState = {
        ...initialStateDefault,
        browser: { ...initialStateDefault.browser, vectorSet: nextState },
      }
      expect(vectorSetSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMoreVectorSetElementsFailure', () => {
    it('should properly set the error', () => {
      const data = 'some error'
      const state = {
        loading: false,
        error: data,
        data: initialState.data,
      }

      const nextState = reducer(
        initialState,
        loadMoreVectorSetElementsFailure(data),
      )

      const rootState = {
        ...initialStateDefault,
        browser: { ...initialStateDefault.browser, vectorSet: nextState },
      }
      expect(vectorSetSelector(rootState)).toEqual(state)
    })
  })

  describe('thunks', () => {
    describe('fetchVectorSetElements', () => {
      const thunkElements = vectorSetElementFactory.buildList(3)
      const data = {
        keyName: vectorSetTestKeyName(),
        total: thunkElements.length,
        nextCursor: vectorSetPaginationCursorAfter(
          thunkElements[thunkElements.length - 1],
        ),
        isPaginationSupported: true,
        elements: thunkElements,
      }

      it('call fetchVectorSetElements, loadVectorSetElementsSuccess when fetch is successful', async () => {
        const responsePayload = { data, status: 200 }
        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        await store.dispatch<any>(
          fetchVectorSetElements({ key: data.keyName as any, count: 10 }),
        )

        const expectedActions = [
          loadVectorSetElements(undefined),
          loadVectorSetElementsSuccess(responsePayload.data),
          updateSelectedKeyRefreshTime(Date.now()),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch VectorSet elements', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }
        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        await store.dispatch<any>(
          fetchVectorSetElements({ key: data.keyName as any, count: 10 }),
        )

        const expectedActions = [
          loadVectorSetElements(undefined),
          addErrorNotification(responsePayload as IAddInstanceErrorPayload),
          loadVectorSetElementsFailure(errorMessage),
        ]

        expect(mockedStore.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchMoreVectorSetElements', () => {
      const moreElements = vectorSetElementFactory.buildList(3)
      const data = {
        keyName: vectorSetTestKeyName(),
        total: faker.number.int({ min: moreElements.length + 1, max: 100 }),
        nextCursor: vectorSetPaginationCursorAfter(
          moreElements[moreElements.length - 1],
        ),
        isPaginationSupported: true,
        elements: moreElements,
      }
      const requestCursor = vectorSetPaginationCursorAfter(
        vectorSetElementFactory.build(),
      )

      it('call fetchMoreVectorSetElements, loadMoreVectorSetElementsSuccess when fetch is successful', async () => {
        const responsePayload = { data, status: 200 }
        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        await store.dispatch<any>(
          fetchMoreVectorSetElements({
            key: data.keyName as any,
            nextCursor: requestCursor,
            count: 10,
          }),
        )

        const expectedActions = [
          loadMoreVectorSetElements(),
          loadMoreVectorSetElementsSuccess(responsePayload.data),
        ]

        expect(mockedStore.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch more VectorSet elements', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }
        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        await store.dispatch<any>(
          fetchMoreVectorSetElements({
            key: data.keyName as any,
            nextCursor: requestCursor,
            count: 10,
          }),
        )

        const expectedActions = [
          loadMoreVectorSetElements(),
          addErrorNotification(responsePayload as IAddInstanceErrorPayload),
          loadMoreVectorSetElementsFailure(errorMessage),
        ]

        expect(mockedStore.getActions()).toEqual(expectedActions)
      })
    })
  })
})
