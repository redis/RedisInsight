import { faker } from '@faker-js/faker'
import axios from 'axios'
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
  addMessageNotification,
  IAddInstanceErrorPayload,
} from 'uiSrc/slices/app/notifications'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { MOCK_TIMESTAMP } from 'uiSrc/mocks/data/dateNow'
import {
  vectorSetElementFactory,
  vectorSetElementWithAttributesFactory,
  vectorSetTestKeyName,
  vectorSetPaginationCursorAfter,
  addVectorSetElementsDataFactory,
} from 'uiSrc/mocks/factories/browser/vectorSet/vectorSetElement.factory'
import {
  deletePatternKeyFromList,
  deleteSelectedKeySuccess,
  refreshKeyInfo,
  updateSelectedKeyRefreshTime,
} from '../../browser/keys'
import reducer, {
  initialState,
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
  addVectorSetElements,
  addVectorSetElementsStateSelector,
  downloadVectorSetEmbedding,
  downloadVectorSetEmbeddingSuccess,
  downloadVectorSetEmbeddingFailure,
  vectorSetSelector,
  vectorSetSimilaritySearchSelector,
  fetchVectorSetElements,
  fetchMoreVectorSetElements,
  deleteVectorSetElements,
  getVectorSetElementDetails,
  setVectorSetElementAttribute,
  fetchDownloadVectorEmbedding,
  loadSimilaritySearch,
  loadSimilaritySearchSuccess,
  loadSimilaritySearchFailure,
  clearSimilaritySearch,
  fetchVectorSetSimilaritySearch,
  loadSimilaritySearchPreview,
  loadSimilaritySearchPreviewSuccess,
  loadSimilaritySearchPreviewFailure,
  clearSimilaritySearchPreview,
  vectorSetSimilaritySearchPreviewSelector,
  fetchVectorSetSimilaritySearchPreview,
  abortVectorSetSimilaritySearchPreview,
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
        downloading: false,
        error: '',
        adding: initialState.adding,
        similaritySearch: initialState.similaritySearch,
        similaritySearchPreview: initialState.similaritySearchPreview,
        data: {
          ...data,
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
        downloading: false,
        error: '',
        adding: initialState.adding,
        similaritySearch: initialState.similaritySearch,
        similaritySearchPreview: initialState.similaritySearchPreview,
        data: {
          ...initialState.data,
          ...data,
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
        downloading: false,
        error: '',
        adding: initialState.adding,
        similaritySearch: initialState.similaritySearch,
        similaritySearchPreview: initialState.similaritySearchPreview,
        data: {
          ...data,
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
        downloading: false,
        error: '',
        adding: initialState.adding,
        similaritySearch: initialState.similaritySearch,
        similaritySearchPreview: initialState.similaritySearchPreview,
        data: {
          ...data,
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
        downloading: false,
        error: data,
        adding: initialState.adding,
        similaritySearch: initialState.similaritySearch,
        similaritySearchPreview: initialState.similaritySearchPreview,
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
        downloading: false,
        error: '',
        adding: initialState.adding,
        similaritySearch: initialState.similaritySearch,
        similaritySearchPreview: initialState.similaritySearchPreview,
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
        downloading: false,
        error: '',
        adding: initialState.adding,
        similaritySearch: initialState.similaritySearch,
        similaritySearchPreview: initialState.similaritySearchPreview,
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
        downloading: false,
        error: data,
        adding: initialState.adding,
        similaritySearch: initialState.similaritySearch,
        similaritySearchPreview: initialState.similaritySearchPreview,
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

  describe('removeVectorSetElements', () => {
    it('should properly set the state before delete', () => {
      const state = {
        ...initialState,
        loading: true,
      }

      const nextState = reducer(initialState, removeVectorSetElements())

      const rootState = {
        ...initialStateDefault,
        browser: { ...initialStateDefault.browser, vectorSet: nextState },
      }
      expect(vectorSetSelector(rootState)).toEqual(state)
    })
  })

  describe('removeVectorSetElementsSuccess', () => {
    it('should properly set the state after successful delete', () => {
      const prevState = {
        ...initialState,
        loading: true,
      }

      const state = {
        ...initialState,
        loading: false,
      }

      const nextState = reducer(prevState, removeVectorSetElementsSuccess())

      const rootState = {
        ...initialStateDefault,
        browser: { ...initialStateDefault.browser, vectorSet: nextState },
      }
      expect(vectorSetSelector(rootState)).toEqual(state)
    })
  })

  describe('removeVectorSetElementsFailure', () => {
    it('should properly set the error after failed delete', () => {
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
      }

      const nextState = reducer(
        initialState,
        removeVectorSetElementsFailure(data),
      )

      const rootState = {
        ...initialStateDefault,
        browser: { ...initialStateDefault.browser, vectorSet: nextState },
      }
      expect(vectorSetSelector(rootState)).toEqual(state)
    })
  })

  describe('downloadVectorSetEmbedding', () => {
    it('should set downloading true without affecting loading', () => {
      const nextState = reducer(initialState, downloadVectorSetEmbedding())

      expect(nextState.downloading).toBe(true)
      expect(nextState.loading).toBe(false)
    })
  })

  describe('downloadVectorSetEmbeddingSuccess', () => {
    it('should set downloading false', () => {
      const prevState = { ...initialState, downloading: true, error: 'old' }
      const nextState = reducer(prevState, downloadVectorSetEmbeddingSuccess())

      expect(nextState.downloading).toBe(false)
    })
  })

  describe('downloadVectorSetEmbeddingFailure', () => {
    it('should set downloading false and store error', () => {
      const prevState = { ...initialState, downloading: true }
      const nextState = reducer(
        prevState,
        downloadVectorSetEmbeddingFailure('download failed'),
      )

      expect(nextState.downloading).toBe(false)
      expect(nextState.error).toBe('download failed')
    })
  })

  describe('removeElementsFromList', () => {
    it('should filter out deleted elements and decrement total', () => {
      const elements = vectorSetElementFactory.buildList(3)
      const stateWithElements = {
        ...initialState,
        data: {
          ...initialState.data,
          total: 3,
          elements,
        },
      }

      const nextState = reducer(
        stateWithElements,
        removeElementsFromList([elements[0].name]),
      )

      expect(nextState.data.elements).toHaveLength(2)
      expect(nextState.data.total).toEqual(2)
    })
  })

  describe('thunks', () => {
    describe('fetchVectorSetElements', () => {
      const thunkElements = vectorSetElementFactory.buildList(3)
      const apiResponse = {
        keyName: vectorSetTestKeyName(),
        total: thunkElements.length,
        nextCursor: vectorSetPaginationCursorAfter(
          thunkElements[thunkElements.length - 1],
        ),
        isPaginationSupported: true,
        elementNames: thunkElements.map((el) => el.name),
      }

      it('call fetchVectorSetElements, loadVectorSetElementsSuccess when fetch is successful', async () => {
        const responsePayload = { data: apiResponse, status: 200 }
        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        await store.dispatch<any>(
          fetchVectorSetElements({
            key: apiResponse.keyName as any,
            count: 10,
          }),
        )

        const { elementNames, ...rest } = apiResponse
        const expectedActions = [
          loadVectorSetElements(undefined),
          loadVectorSetElementsSuccess({
            ...rest,
            elements: elementNames.map((name) => ({ name })),
          }),
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
          fetchVectorSetElements({
            key: apiResponse.keyName as any,
            count: 10,
          }),
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
      const moreApiResponse = {
        keyName: vectorSetTestKeyName(),
        total: faker.number.int({ min: moreElements.length + 1, max: 100 }),
        nextCursor: vectorSetPaginationCursorAfter(
          moreElements[moreElements.length - 1],
        ),
        isPaginationSupported: true,
        elementNames: moreElements.map((el) => el.name),
      }
      const requestCursor = vectorSetPaginationCursorAfter(
        vectorSetElementFactory.build(),
      )

      it('call fetchMoreVectorSetElements, loadMoreVectorSetElementsSuccess when fetch is successful', async () => {
        const responsePayload = { data: moreApiResponse, status: 200 }
        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        await store.dispatch<any>(
          fetchMoreVectorSetElements({
            key: moreApiResponse.keyName as any,
            nextCursor: requestCursor,
            count: 10,
          }),
        )

        const { elementNames: moreElementNames, ...moreRest } = moreApiResponse
        const expectedActions = [
          loadMoreVectorSetElements(),
          loadMoreVectorSetElementsSuccess({
            ...moreRest,
            elements: moreElementNames.map((name) => ({ name })),
          }),
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
            key: moreApiResponse.keyName as any,
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

    describe('deleteVectorSetElements', () => {
      const key = 'key'
      const elements = ['elem1', 'elem2']

      it('should dispatch success actions when delete is successful', async () => {
        const responsePayload = { status: 200, data: { affected: 2 } }
        apiService.delete = jest.fn().mockResolvedValue(responsePayload)

        const nextState = {
          ...initialStateDefault,
          browser: {
            ...initialStateDefault.browser,
            vectorSet: {
              ...initialState,
              data: {
                ...initialState.data,
                total: 10,
              },
            },
          },
        }

        const storeWithData = mockStore(nextState)

        await storeWithData.dispatch<any>(
          deleteVectorSetElements(key as any, elements as any),
        )

        const expectedActions = [
          removeVectorSetElements(),
          removeVectorSetElementsSuccess(),
          removeElementsFromList(elements),
          refreshKeyInfo(),
          addMessageNotification(
            successMessages.REMOVED_KEY_VALUE(
              key,
              elements.join(''),
              'Element',
            ),
          ),
        ]

        expect(
          storeWithData.getActions().slice(0, expectedActions.length),
        ).toEqual(expectedActions)
      })

      it('should dispatch delete key actions when last elements are removed', async () => {
        const responsePayload = { status: 200, data: { affected: 2 } }
        apiService.delete = jest.fn().mockResolvedValue(responsePayload)

        const nextState = {
          ...initialStateDefault,
          browser: {
            ...initialStateDefault.browser,
            vectorSet: {
              ...initialState,
              data: {
                ...initialState.data,
                total: 2,
              },
            },
          },
        }

        const storeWithData = mockStore(nextState)

        await storeWithData.dispatch<any>(
          deleteVectorSetElements(key as any, elements as any),
        )

        const expectedActions = [
          removeVectorSetElements(),
          removeVectorSetElementsSuccess(),
          removeElementsFromList(elements),
          deleteSelectedKeySuccess(),
          deletePatternKeyFromList(key),
          addMessageNotification(successMessages.DELETED_KEY(key)),
        ]

        expect(storeWithData.getActions()).toEqual(expectedActions)
      })

      it('should dispatch failure actions when delete fails', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }
        apiService.delete = jest.fn().mockRejectedValue(responsePayload)

        await store.dispatch<any>(
          deleteVectorSetElements(key as any, elements as any),
        )

        const expectedActions = [
          removeVectorSetElements(),
          addErrorNotification(
            responsePayload as unknown as IAddInstanceErrorPayload,
          ),
          removeVectorSetElementsFailure(errorMessage),
        ]

        expect(mockedStore.getActions()).toEqual(expectedActions)
      })
    })

    describe('setVectorSetElementAttribute', () => {
      const mockElement = vectorSetElementWithAttributesFactory.build()
      const key = vectorSetTestKeyName()
      const { name: element, attributes } = mockElement

      it('should dispatch updateElementAttributes with response data when set is successful', async () => {
        const responsePayload = {
          status: 200,
          data: { attributes },
        }
        apiService.put = jest.fn().mockResolvedValue(responsePayload)

        const onSuccess = jest.fn()

        await store.dispatch<any>(
          setVectorSetElementAttribute(
            key as any,
            element,
            attributes!,
            onSuccess,
          ),
        )

        const expectedActions = [
          updateElementAttributes({
            element,
            attributes: attributes!,
          }),
        ]

        expect(store.getActions()).toEqual(expectedActions)
        expect(onSuccess).toHaveBeenCalledTimes(1)
      })

      it('should dispatch error notification when set fails', async () => {
        const responsePayload = {
          response: {
            status: 500,
            data: { message: 'Something was wrong!' },
          },
        }
        apiService.put = jest.fn().mockRejectedValue(responsePayload)

        await store.dispatch<any>(
          setVectorSetElementAttribute(key as any, element, attributes!),
        )

        const expectedActions = [
          addErrorNotification(
            responsePayload as unknown as IAddInstanceErrorPayload,
          ),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('getVectorSetElementDetails', () => {
      const mockElement = vectorSetElementWithAttributesFactory.build()
      const key = vectorSetTestKeyName()
      const { name: element, attributes } = mockElement

      it('should dispatch updateElementAttributes and call onSuccess with full details', async () => {
        const responsePayload = {
          status: 200,
          data: {
            name: element,
            vector: [0.1, 0.2, 0.3],
            attributes,
          },
        }
        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        const onSuccess = jest.fn()

        await store.dispatch<any>(
          getVectorSetElementDetails(key as any, element, onSuccess),
        )

        const expectedActions = [
          updateElementAttributes({
            element,
            attributes: attributes!,
          }),
        ]

        expect(store.getActions()).toEqual(expectedActions)
        expect(onSuccess).toHaveBeenCalledTimes(1)
        expect(onSuccess).toHaveBeenCalledWith(responsePayload.data)
      })

      it('should dispatch updateElementAttributes with empty string when attributes is undefined', async () => {
        const responsePayload = {
          status: 200,
          data: {
            name: element,
            vector: [0.1, 0.2],
            attributes: undefined,
          },
        }
        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        await store.dispatch<any>(
          getVectorSetElementDetails(key as any, element),
        )

        const expectedActions = [
          updateElementAttributes({
            element,
            attributes: '',
          }),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('should dispatch error notification when get fails', async () => {
        const responsePayload = {
          response: {
            status: 500,
            data: { message: 'Something was wrong!' },
          },
        }
        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        await store.dispatch<any>(
          getVectorSetElementDetails(key as any, element),
        )

        const expectedActions = [
          addErrorNotification(
            responsePayload as unknown as IAddInstanceErrorPayload,
          ),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchDownloadVectorEmbedding', () => {
      const key = vectorSetTestKeyName()
      const element = vectorSetElementFactory.build().name

      it('should dispatch success actions when download succeeds', async () => {
        const responsePayload = {
          status: 200,
          data: '[0.1, 0.2, 0.3]',
          headers: {
            'content-disposition': 'attachment;filename="vector_embedding"',
          },
        }
        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        const onSuccess = jest.fn()

        await store.dispatch<any>(
          fetchDownloadVectorEmbedding(key as any, element, onSuccess),
        )

        const expectedActions = [
          downloadVectorSetEmbedding(),
          downloadVectorSetEmbeddingSuccess(),
        ]

        expect(store.getActions()).toEqual(expectedActions)
        expect(onSuccess).toHaveBeenCalledWith(
          responsePayload.data,
          responsePayload.headers,
        )
      })

      it('should dispatch failure actions when download fails', async () => {
        const errorMessage = 'Download failed!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }
        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        await store.dispatch<any>(
          fetchDownloadVectorEmbedding(key as any, element),
        )

        const expectedActions = [
          downloadVectorSetEmbedding(),
          addErrorNotification(
            responsePayload as unknown as IAddInstanceErrorPayload,
          ),
          downloadVectorSetEmbeddingFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })

  describe('updateElementAttributes', () => {
    it('should update attributes of a matching element', () => {
      const elements = vectorSetElementWithAttributesFactory.buildList(3)
      const stateWithElements = {
        ...initialState,
        data: {
          ...initialState.data,
          total: 3,
          elements,
        },
      }

      const newAttributes = '{"updated":true}'
      const nextState = reducer(
        stateWithElements,
        updateElementAttributes({
          element: elements[1].name,
          attributes: newAttributes,
        }),
      )

      expect(nextState.data.elements[1].attributes).toEqual(newAttributes)
      expect(nextState.data.elements[0].attributes).toEqual(
        elements[0].attributes,
      )
    })
  })

  describe('addElements', () => {
    it('should set adding.loading true and clear error', () => {
      const nextState = reducer(initialState, addElements())

      expect(nextState.adding.loading).toBe(true)
      expect(nextState.adding.error).toBe('')
    })
  })

  describe('addElementsSuccess', () => {
    it('should set adding.loading false', () => {
      const prevState = {
        ...initialState,
        adding: { loading: true, error: '' },
      }
      const nextState = reducer(prevState, addElementsSuccess())

      expect(nextState.adding.loading).toBe(false)
    })
  })

  describe('addElementsFailure', () => {
    it('should set adding.loading false and store error', () => {
      const prevState = {
        ...initialState,
        adding: { loading: true, error: '' },
      }
      const nextState = reducer(prevState, addElementsFailure('add failed'))

      expect(nextState.adding.loading).toBe(false)
      expect(nextState.adding.error).toBe('add failed')
    })
  })

  describe('addVectorSetElementsStateSelector', () => {
    it('should return the adding state', () => {
      const addingState = { loading: true, error: 'err' }
      const rootState = {
        ...initialStateDefault,
        browser: {
          ...initialStateDefault.browser,
          vectorSet: { ...initialState, adding: addingState },
        },
      }
      expect(addVectorSetElementsStateSelector(rootState)).toEqual(addingState)
    })
  })

  describe('addVectorSetElements thunk', () => {
    const elementsData = addVectorSetElementsDataFactory.build()

    it('should dispatch success actions when add is successful', async () => {
      const responsePayload = { status: 200 }
      apiService.put = jest.fn().mockResolvedValue(responsePayload)

      const onSuccess = jest.fn()

      await store.dispatch<any>(addVectorSetElements(elementsData, onSuccess))

      const expectedActions = [addElements(), addElementsSuccess()]

      expect(store.getActions().slice(0, expectedActions.length)).toEqual(
        expectedActions,
      )
      expect(onSuccess).toHaveBeenCalledTimes(1)

      expect(apiService.put).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          keyName: elementsData.keyName,
          elements: elementsData.elements.map((el) =>
            expect.objectContaining({
              vectorValues: el.vectorValues,
            }),
          ),
        }),
        expect.any(Object),
      )
    })

    it('should dispatch failure actions when add fails', async () => {
      const errorMessage = 'Something was wrong!'
      const responsePayload = {
        response: {
          status: 500,
          data: { message: errorMessage },
        },
      }
      apiService.put = jest.fn().mockRejectedValue(responsePayload)

      const onFail = jest.fn()

      await store.dispatch<any>(
        addVectorSetElements(elementsData, undefined, onFail),
      )

      const expectedActions = [
        addElements(),
        addErrorNotification(
          responsePayload as unknown as IAddInstanceErrorPayload,
        ),
        addElementsFailure(errorMessage),
      ]

      expect(store.getActions()).toEqual(expectedActions)
      expect(onFail).toHaveBeenCalledTimes(1)
    })
  })

  describe('similaritySearch reducers', () => {
    const buildSearchResponse = () => ({
      keyName: vectorSetTestKeyName(),
      elements: [
        {
          name: vectorSetElementFactory.build().name,
          score: 0.95,
          attributes: '{"k":"v"}',
        },
        {
          name: vectorSetElementFactory.build().name,
          score: 0.81,
        },
      ],
    })

    it('loadSimilaritySearch: should set loading and clear error', () => {
      const prevState = {
        ...initialState,
        similaritySearch: {
          loading: false,
          error: 'previous',
          data: undefined,
        },
      }

      const nextState = reducer(prevState, loadSimilaritySearch())

      expect(nextState.similaritySearch.loading).toBe(true)
      expect(nextState.similaritySearch.error).toBe('')
    })

    it('loadSimilaritySearchSuccess: should store the response and clear loading', () => {
      const response = buildSearchResponse()
      const prevState = {
        ...initialState,
        similaritySearch: {
          ...initialState.similaritySearch,
          loading: true,
        },
      }
      const nextState = reducer(
        prevState,
        loadSimilaritySearchSuccess(response as any),
      )

      expect(nextState.similaritySearch).toEqual({
        loading: false,
        error: '',
        data: response,
      })
    })

    it('loadSimilaritySearchFailure: should store the error and clear loading', () => {
      const prevState = {
        ...initialState,
        similaritySearch: {
          ...initialState.similaritySearch,
          loading: true,
        },
      }
      const nextState = reducer(prevState, loadSimilaritySearchFailure('boom'))

      expect(nextState.similaritySearch.loading).toBe(false)
      expect(nextState.similaritySearch.error).toBe('boom')
    })

    it('clearSimilaritySearch: should reset to initial similarity-search state', () => {
      const prevState = {
        ...initialState,
        similaritySearch: {
          loading: false,
          error: 'old',
          data: buildSearchResponse() as any,
        },
      }

      const nextState = reducer(prevState, clearSimilaritySearch())

      expect(nextState.similaritySearch).toEqual(initialState.similaritySearch)
    })

    it('vectorSetSimilaritySearchSelector returns the slice state', () => {
      const similaritySearch = {
        loading: false,
        error: '',
        data: buildSearchResponse() as any,
      }
      const rootState = {
        ...initialStateDefault,
        browser: {
          ...initialStateDefault.browser,
          vectorSet: { ...initialState, similaritySearch },
        },
      }

      expect(vectorSetSimilaritySearchSelector(rootState)).toEqual(
        similaritySearch,
      )
    })
  })

  describe('fetchVectorSetSimilaritySearch thunk', () => {
    const buildPayload = () =>
      ({
        keyName: vectorSetTestKeyName(),
        vectorValues: [1, 2, 3],
        count: 5,
      }) as any

    it('should dispatch success actions when the request succeeds', async () => {
      const payload = buildPayload()
      const responseData = {
        keyName: payload.keyName,
        elements: [
          { name: vectorSetElementFactory.build().name, score: 0.9 },
          { name: vectorSetElementFactory.build().name, score: 0.5 },
        ],
      }
      apiService.post = jest
        .fn()
        .mockResolvedValue({ status: 200, data: responseData })

      await store.dispatch<any>(fetchVectorSetSimilaritySearch(payload))

      expect(store.getActions()).toEqual([
        loadSimilaritySearch(),
        loadSimilaritySearchSuccess(responseData as any),
      ])
    })

    it('should dispatch failure actions when the request fails', async () => {
      const payload = buildPayload()
      const errorMessage = 'wrong type'
      const responsePayload = {
        response: { status: 400, data: { message: errorMessage } },
      }
      apiService.post = jest.fn().mockRejectedValue(responsePayload)

      await store.dispatch<any>(fetchVectorSetSimilaritySearch(payload))

      expect(store.getActions()).toEqual([
        loadSimilaritySearch(),
        addErrorNotification(
          responsePayload as unknown as IAddInstanceErrorPayload,
        ),
        loadSimilaritySearchFailure(errorMessage),
      ])
    })

    it('should send the payload verbatim to the similarity-search endpoint', async () => {
      const payload = buildPayload()
      apiService.post = jest.fn().mockResolvedValue({
        status: 200,
        data: { keyName: payload.keyName, elements: [] },
      })

      await store.dispatch<any>(fetchVectorSetSimilaritySearch(payload))

      expect(apiService.post).toHaveBeenCalledWith(
        expect.stringContaining('vector-set/similarity-search'),
        payload,
        expect.any(Object),
      )
    })

    it('should dispatch failure when the response status is not successful and no error is thrown', async () => {
      const payload = buildPayload()
      apiService.post = jest.fn().mockResolvedValue({
        status: 304,
        data: { keyName: payload.keyName, elements: [] },
      })

      await store.dispatch<any>(fetchVectorSetSimilaritySearch(payload))

      expect(store.getActions()).toEqual([
        loadSimilaritySearch(),
        loadSimilaritySearchFailure('Something was wrong!'),
      ])
    })
  })

  describe('similaritySearchPreview reducers', () => {
    it('loadSimilaritySearchPreview: should set loading and clear error', () => {
      const prevState = {
        ...initialState,
        similaritySearchPreview: {
          loading: false,
          error: 'previous',
          preview: 'stale',
        },
      }

      const nextState = reducer(prevState, loadSimilaritySearchPreview())

      expect(nextState.similaritySearchPreview.loading).toBe(true)
      expect(nextState.similaritySearchPreview.error).toBe('')
      expect(nextState.similaritySearchPreview.preview).toBe('stale')
    })

    it('loadSimilaritySearchPreviewSuccess: should store the preview string and clear loading', () => {
      const prevState = {
        ...initialState,
        similaritySearchPreview: {
          ...initialState.similaritySearchPreview,
          loading: true,
        },
      }
      const nextState = reducer(
        prevState,
        loadSimilaritySearchPreviewSuccess('VSIM mykey VALUES 3 1 2 3'),
      )

      expect(nextState.similaritySearchPreview).toEqual({
        loading: false,
        error: '',
        preview: 'VSIM mykey VALUES 3 1 2 3',
      })
    })

    it('loadSimilaritySearchPreviewFailure: should store the error and clear loading', () => {
      const prevState = {
        ...initialState,
        similaritySearchPreview: {
          loading: true,
          error: '',
          preview: 'last good',
        },
      }
      const nextState = reducer(
        prevState,
        loadSimilaritySearchPreviewFailure('boom'),
      )

      expect(nextState.similaritySearchPreview.loading).toBe(false)
      expect(nextState.similaritySearchPreview.error).toBe('boom')
      expect(nextState.similaritySearchPreview.preview).toBe('last good')
    })

    it('clearSimilaritySearchPreview: should reset to initial preview state', () => {
      const prevState = {
        ...initialState,
        similaritySearchPreview: {
          loading: false,
          error: 'old',
          preview: 'stale',
        },
      }

      const nextState = reducer(prevState, clearSimilaritySearchPreview())

      expect(nextState.similaritySearchPreview).toEqual(
        initialState.similaritySearchPreview,
      )
    })

    it('vectorSetSimilaritySearchPreviewSelector returns the slice state', () => {
      const similaritySearchPreview = {
        loading: false,
        error: '',
        preview: 'VSIM mykey ELE foo COUNT 5 WITHSCORES WITHATTRIBS',
      }
      const rootState = {
        ...initialStateDefault,
        browser: {
          ...initialStateDefault.browser,
          vectorSet: { ...initialState, similaritySearchPreview },
        },
      }

      expect(vectorSetSimilaritySearchPreviewSelector(rootState)).toEqual(
        similaritySearchPreview,
      )
    })
  })

  describe('fetchVectorSetSimilaritySearchPreview thunk', () => {
    const buildPreviewPayload = () =>
      ({
        keyName: vectorSetTestKeyName(),
        mode: 'VECTOR' as const,
        vectorValues: [1, 2, 3],
        count: 5,
      }) as any

    it('should dispatch success with the preview string when the request succeeds', async () => {
      const payload = buildPreviewPayload()
      const preview = 'VSIM key VALUES 3 1 2 3 COUNT 5 WITHSCORES WITHATTRIBS'
      apiService.post = jest
        .fn()
        .mockResolvedValue({ status: 200, data: { preview } })

      await store.dispatch<any>(fetchVectorSetSimilaritySearchPreview(payload))

      expect(store.getActions()).toEqual([
        loadSimilaritySearchPreview(),
        loadSimilaritySearchPreviewSuccess(preview),
      ])
    })

    it('should dispatch failure (without an error notification) when the request fails', async () => {
      const payload = buildPreviewPayload()
      const errorMessage = 'bad dto'
      apiService.post = jest.fn().mockRejectedValue({
        response: { status: 400, data: { message: errorMessage } },
      })

      await store.dispatch<any>(fetchVectorSetSimilaritySearchPreview(payload))

      expect(store.getActions()).toEqual([
        loadSimilaritySearchPreview(),
        loadSimilaritySearchPreviewFailure(errorMessage),
      ])
    })

    it('should hit the similarity-search/preview endpoint with the payload', async () => {
      const payload = buildPreviewPayload()
      apiService.post = jest
        .fn()
        .mockResolvedValue({ status: 200, data: { preview: '' } })

      await store.dispatch<any>(fetchVectorSetSimilaritySearchPreview(payload))

      expect(apiService.post).toHaveBeenCalledWith(
        expect.stringContaining('vector-set/similarity-search/preview'),
        payload,
        expect.any(Object),
      )
    })

    it('should pass an AbortSignal to apiService.post so the request can be aborted', async () => {
      const payload = buildPreviewPayload()
      apiService.post = jest
        .fn()
        .mockResolvedValue({ status: 200, data: { preview: '' } })

      await store.dispatch<any>(fetchVectorSetSimilaritySearchPreview(payload))

      const [, , config] = (apiService.post as jest.Mock).mock.calls[0]
      expect(config?.signal).toBeInstanceOf(AbortSignal)
    })

    it('should not dispatch any success/failure action when the request is aborted before it resolves', async () => {
      const payload = buildPreviewPayload()
      let capturedSignal: AbortSignal | undefined
      apiService.post = jest.fn().mockImplementation((_url, _body, config) => {
        capturedSignal = config?.signal
        return new Promise((_resolve, reject) => {
          capturedSignal?.addEventListener('abort', () => {
            const cancelError = new axios.Cancel('aborted by client')
            reject(cancelError)
          })
        })
      })

      const dispatchPromise = store.dispatch<any>(
        fetchVectorSetSimilaritySearchPreview(payload),
      )

      abortVectorSetSimilaritySearchPreview()
      await dispatchPromise

      expect(store.getActions()).toEqual([loadSimilaritySearchPreview()])
    })

    it('should abort the previous in-flight request when a newer dispatch is made', async () => {
      const payload = buildPreviewPayload()
      const signals: AbortSignal[] = []
      apiService.post = jest.fn().mockImplementation((_url, _body, config) => {
        signals.push(config?.signal)
        return new Promise((resolve, reject) => {
          config?.signal?.addEventListener('abort', () => {
            reject(new axios.Cancel('aborted by client'))
          })
          // Resolve the second call only — keeps the first one pending so
          // it gets aborted when the second dispatch starts.
          if (signals.length > 1) {
            resolve({ status: 200, data: { preview: 'done' } })
          }
        })
      })

      const first = store.dispatch<any>(
        fetchVectorSetSimilaritySearchPreview(payload),
      )
      const second = store.dispatch<any>(
        fetchVectorSetSimilaritySearchPreview(payload),
      )

      await Promise.all([first, second])

      expect(signals[0].aborted).toBe(true)
      expect(signals[1].aborted).toBe(false)
      expect(store.getActions()).toEqual([
        loadSimilaritySearchPreview(),
        loadSimilaritySearchPreview(),
        loadSimilaritySearchPreviewSuccess('done'),
      ])
    })
  })
})
