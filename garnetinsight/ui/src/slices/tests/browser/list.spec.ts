import { AxiosError } from 'axios'
import { cloneDeep } from 'lodash'
import { apiService } from 'uiSrc/services'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
  mockStore,
} from 'uiSrc/utils/test-utils'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { stringToBuffer } from 'uiSrc/utils'
import { deleteRedisearchKeyFromList } from 'uiSrc/slices/browser/redisearch'
import { MOCK_TIMESTAMP } from 'uiSrc/mocks/data/dateNow'
import {
  DeleteListElementsDto,
  PushElementToListDto,
} from 'apiSrc/modules/browser/list/dto'
import {
  defaultSelectedKeyAction,
  deleteSelectedKeySuccess,
  refreshKeyInfo,
  updateSelectedKeyRefreshTime,
} from '../../browser/keys'
import reducer, {
  initialState,
  setListInitialState,
  loadListElements,
  loadListElementsSuccess,
  loadListElementsFailure,
  loadMoreListElements,
  loadMoreListElementsSuccess,
  loadMoreListElementsFailure,
  updateValue,
  updateValueSuccess,
  updateValueFailure,
  resetUpdateValue,
  updateElementInList,
  loadSearchingListElement,
  loadSearchingListElementSuccess,
  loadSearchingListElementFailure,
  insertListElements,
  insertListElementsSuccess,
  insertListElementsFailure,
  listSelector,
  fetchListElements,
  fetchMoreListElements,
  fetchSearchingListElementAction,
  refreshListElementsAction,
  updateListElementAction,
  insertListElementsAction,
  deleteListElementsAction,
  deleteListElements,
  deleteListElementsSuccess,
  deleteListElementsFailure,
} from '../../browser/list'
import {
  addErrorNotification,
  addMessageNotification,
} from '../../app/notifications'

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

describe('list slice', () => {
  beforeAll(() => {
    dateNow = jest.spyOn(Date, 'now').mockImplementation(() => MOCK_TIMESTAMP)
  })

  afterAll(() => {
    dateNow.mockRestore()
  })

  describe('setListInitialState', () => {
    it('should properly set initialState', () => {
      // Arrange
      const state = initialState

      // Act
      const nextState = reducer(initialState, setListInitialState())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { list: nextState },
      }
      expect(listSelector(rootState)).toEqual(state)
    })
  })

  describe('loadListElements', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, loadListElements())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { list: nextState },
      }
      expect(listSelector(rootState)).toEqual(state)
    })
  })

  describe('loadListElementsSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const data = {
        key: stringToBuffer('list'),
        keyName: stringToBuffer('list'),
        elements: ['1', '2', '3'].map((element) => stringToBuffer(element)),
        total: 1,
        count: 123,
      }

      const state = {
        ...initialState,
        loading: false,
        error: '',
        data: {
          ...initialState.data,
          ...data,
          elements: data.elements.map((element, i) => ({ index: i, element })),
        },
      }

      // Act
      const nextState = reducer(initialState, loadListElementsSuccess(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { list: nextState },
      }
      expect(listSelector(rootState)).toEqual(state)
    })
  })

  describe('loadListElementsFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
      }

      // Act
      const nextState = reducer(initialState, loadListElementsFailure(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { list: nextState },
      }
      expect(listSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMoreListElements', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
        error: '',
      }

      // Act
      const nextState = reducer(initialState, loadMoreListElements())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { list: nextState },
      }
      expect(listSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMoreListElementsSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const data = {
        keyName: 'list',
        key: 'list',
        elements: ['1', '23', '432'].map((element) => stringToBuffer(element)),
        // elements: ['1', '23', '432'].map((element, i) => ({ element: stringToBuffer(element), index: i })),
        total: 1,
      }

      const state = {
        ...initialState,
        loading: false,
        data: {
          ...initialState.data,
          elements: data.elements
            .concat(data.elements)
            .map((element, i) => ({ element, index: i })),
        },
      }

      const initialStateWithElements = {
        ...initialState,
        data: {
          ...initialState.data,
          elements: data.elements.map((element, i) => ({ element, index: i })),
        },
      }

      // Act
      const nextState = reducer(
        initialStateWithElements,
        loadMoreListElementsSuccess(data),
      )

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { list: nextState },
      }
      expect(listSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data = {
        keyName: 'hash',
        elements: [],
        total: 0,
      }

      // Act
      const nextState = reducer(initialState, loadMoreListElementsSuccess(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { list: nextState },
      }
      expect(listSelector(rootState)).toEqual(initialState)
    })
  })

  describe('loadMoreListElementsFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
      }

      // Act
      const nextState = reducer(initialState, loadMoreListElementsFailure(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { list: nextState },
      }
      expect(listSelector(rootState)).toEqual(state)
    })
  })

  describe('updateValue', () => {
    it('should properly set the state while updating a list key', () => {
      // Arrange
      const state = {
        ...initialState,
        updateValue: {
          ...initialState.updateValue,
          loading: true,
          error: '',
        },
      }

      // Act
      const nextState = reducer(initialState, updateValue())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { list: nextState },
      }
      expect(listSelector(rootState)).toEqual(state)
    })
  })

  describe('updateValueSuccess', () => {
    it('should properly set the state after successfully updated list key', () => {
      // Arrange

      const state = {
        ...initialState,
        updateValue: {
          ...initialState.updateValue,
          loading: false,
        },
      }

      // Act
      const nextState = reducer(initialState, updateValueSuccess())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { list: nextState },
      }
      expect(listSelector(rootState)).toEqual(state)
    })
  })

  describe('updateValueFailure', () => {
    it('should properly set the state on update list key failure', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        updateValue: {
          ...initialState.updateValue,
          loading: false,
          error: data,
        },
      }

      // Act
      const nextState = reducer(initialState, updateValueFailure(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { list: nextState },
      }
      expect(listSelector(rootState)).toEqual(state)
    })
  })

  describe('resetUpdateValue', () => {
    it('should properly reset the state', () => {
      // Arrange;
      const state = {
        ...initialState,
        updateValue: {
          ...initialState.updateValue,
          loading: false,
          error: '',
        },
      }

      // Act
      const nextState = reducer(initialState, resetUpdateValue())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { list: nextState },
      }
      expect(listSelector(rootState)).toEqual(state)
    })
  })

  describe('loadSearchingListElement', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const searchedIndex = 10
      const state = {
        ...initialState,
        loading: true,
        error: '',
        data: {
          ...initialState.data,
          searchedIndex,
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        loadSearchingListElement(searchedIndex),
      )

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { list: nextState },
      }
      expect(listSelector(rootState)).toEqual(state)
    })
  })

  describe('loadSearchingListElementSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const data = {
        keyName: stringToBuffer('list'),
        value: stringToBuffer('12311'),
      }

      const state = {
        ...initialState,
        loading: false,
        data: {
          ...initialState.data,
          elements: [{ element: data.value, index: 0 }],
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        loadSearchingListElementSuccess([0, data]),
      )

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { list: nextState },
      }
      expect(listSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data = {
        keyName: stringToBuffer('list'),
        value: stringToBuffer(''),
      }

      const state = {
        ...initialState,
        loading: false,
        data: {
          ...initialState.data,
          elements: [{ element: data.value, index: 0 }],
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        loadSearchingListElementSuccess([0, data]),
      )

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { list: nextState },
      }
      expect(listSelector(rootState)).toEqual(state)
    })
  })

  describe('loadSearchingListElementFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
      }

      // Act
      const nextState = reducer(
        initialState,
        loadSearchingListElementFailure(data),
      )

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { list: nextState },
      }
      expect(listSelector(rootState)).toEqual(state)
    })
  })

  describe('insertListElements', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }
      // Act
      const nextState = reducer(initialState, insertListElements())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { list: nextState },
      }
      expect(listSelector(rootState)).toEqual(state)
    })
  })

  describe('insertListElementsSuccess', () => {
    it('should properly set the state after the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: false,
      }
      // Act
      const nextState = reducer(initialState, insertListElementsSuccess())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { list: nextState },
      }
      expect(listSelector(rootState)).toEqual(state)
    })
  })

  describe('insertListElementsFailure', () => {
    it('should properly set the error after the fetch data', () => {
      // Arrange
      const error = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error,
      }

      // Act
      const nextState = reducer(initialState, insertListElementsFailure(error))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { list: nextState },
      }
      expect(listSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteListElements', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }
      // Act
      const nextState = reducer(initialState, deleteListElements())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { list: nextState },
      }
      expect(listSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteListElementsSuccess', () => {
    it('should properly set the state after the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: false,
      }
      // Act
      const nextState = reducer(initialState, deleteListElementsSuccess())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { list: nextState },
      }
      expect(listSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteListElementsFailure', () => {
    it('should properly set the error after the fetch data', () => {
      // Arrange
      const error = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error,
      }

      // Act
      const nextState = reducer(initialState, deleteListElementsFailure(error))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { list: nextState },
      }
      expect(listSelector(rootState)).toEqual(state)
    })
  })

  describe('thunks', () => {
    describe('fetchListElements', () => {
      it('call fetchListElements, loadListElementsSuccess when fetch is successed', async () => {
        // Arrange
        const data = {
          key: 'small list',
          keyName: 'small list',
          elements: ['123', '123', '321'],
          total: 3,
        }

        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchListElements(data.keyName, 0, 20))

        // Assert
        const expectedActions = [
          loadListElements(),
          loadListElementsSuccess(responsePayload.data),
          updateSelectedKeyRefreshTime(Date.now()),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchMoreListElements', () => {
      it('call fetchMoreListElements, loadMoreListElementsSuccess when fetch is successed', async () => {
        // Arrange
        const data = {
          keyName: 'small list',
          elements: ['123', '123', '321'],
          total: 3,
        }
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchMoreListElements(data.keyName, 0, 20))

        // Assert
        const expectedActions = [
          loadMoreListElements(),
          loadMoreListElementsSuccess(responsePayload.data),
        ]

        expect(mockedStore.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchSearchingListElementAction', () => {
      it('call fetchSearchingListElementAction, loadSearchingListElementSuccess when search is successed', async () => {
        // Arrange
        const searchingIndex = 10
        const data = {
          keyName: stringToBuffer('small list'),
          value: stringToBuffer('value'),
        }

        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          fetchSearchingListElementAction(data.keyName, searchingIndex),
        )

        // Assert
        const expectedActions = [
          loadSearchingListElement(searchingIndex),
          loadSearchingListElementSuccess([
            searchingIndex,
            responsePayload.data,
          ]),
          updateSelectedKeyRefreshTime(Date.now()),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('refreshListElementsAction', () => {
      it('call refreshListElementsAction without searchingIndex, call loadListElements when fetch is successed', async () => {
        // Act
        await store.dispatch<any>(refreshListElementsAction())

        // Assert
        const expectedActions = [loadListElements()]

        expect(store.getActions().slice(0, expectedActions.length)).toEqual(
          expectedActions,
        )
      })
    })

    describe('updateListElementAction', () => {
      const keyName = 'key'
      const data = {
        keyName,
        index: 123,
        element: 'value',
      }
      it('succeed to update element in list', async () => {
        // Arrange
        const responsePayload = { status: 200 }
        apiService.patch = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(updateListElementAction(data))

        // Assert
        const expectedActions = [
          updateValue(),
          updateValueSuccess(),
          updateElementInList(data),
          refreshKeyInfo(),
        ]

        expect(store.getActions().slice(0, expectedActions.length)).toEqual(
          expectedActions,
        )
      })
      it('failed to update element in list', async () => {
        // Arrange
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }
        apiService.patch = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(updateListElementAction(data))

        // Assert
        const expectedActions = [
          updateValue(),
          addErrorNotification(responsePayload as AxiosError),
          updateValueFailure(errorMessage),
        ]

        expect(mockedStore.getActions()).toEqual(expectedActions)
      })
    })

    describe('insertListElementsAction', () => {
      const data = {
        keyName: 'keyName',
        destination: 'TAIL',
        element: 'value',
      } as PushElementToListDto
      it('succeed to insert element in list', async () => {
        // Arrange
        const responsePayload = { status: 200 }
        apiService.put = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(insertListElementsAction(data))

        // Assert
        const expectedActions = [
          insertListElements(),
          insertListElementsSuccess(),
          defaultSelectedKeyAction(),
        ]

        expect(
          mockedStore.getActions().slice(0, expectedActions.length),
        ).toEqual(expectedActions)
      })
      it('failed to insert element in list', async () => {
        // Arrange
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }
        apiService.put = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(insertListElementsAction(data))

        // Assert
        const expectedActions = [
          insertListElements(),
          addErrorNotification(responsePayload as AxiosError),
          insertListElementsFailure(errorMessage),
        ]

        expect(mockedStore.getActions()).toEqual(expectedActions)
      })
    })

    describe('deleteListElementsAction', () => {
      const data = {
        keyName: 'keyName',
        destination: 'TAIL',
        count: 2,
      } as DeleteListElementsDto
      it('succeed to delete elements from list', async () => {
        // Arrange
        const responsePayload = {
          status: 200,
          data: { elements: ['zx', 'zz'] },
        }
        const nextState = {
          ...initialStateDefault,
          browser: {
            ...initialStateDefault.browser,
            list: {
              ...initialState,
              data: {
                ...initialState.data,
                total: 10,
              },
            },
          },
        }

        const mockedStore = mockStore(nextState)

        apiService.delete = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await mockedStore.dispatch<any>(deleteListElementsAction(data))

        // Assert
        const expectedActions = [
          deleteListElements(),
          deleteListElementsSuccess(),
          defaultSelectedKeyAction(),
          addMessageNotification(
            successMessages.REMOVED_LIST_ELEMENTS(
              data.keyName,
              data.count,
              responsePayload.data.elements,
            ),
          ),
        ]

        expect(
          mockedStore.getActions().slice(0, expectedActions.length),
        ).toEqual(expectedActions)
      })

      it('succeed to delete all elements from list', async () => {
        // Arrange
        const responsePayload = { status: 200 }
        const nextState = {
          ...initialStateDefault,
          browser: {
            list: {
              ...initialState,
              data: {
                ...initialState.data,
                total: 2,
              },
            },
          },
        }

        const mockedStore = mockStore(nextState)

        apiService.delete = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await mockedStore.dispatch<any>(deleteListElementsAction(data))

        // Assert
        const expectedActions = [
          deleteListElements(),
          deleteListElementsSuccess(),
          deleteSelectedKeySuccess(),
          deleteRedisearchKeyFromList(data.keyName),
          addMessageNotification(successMessages.DELETED_KEY(data.keyName)),
        ]

        expect(mockedStore.getActions()).toEqual(expectedActions)
      })

      it('failed to delete elements in list', async () => {
        // Arrange
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }
        apiService.delete = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(deleteListElementsAction(data))

        // Assert
        const expectedActions = [
          deleteListElements(),
          addErrorNotification(responsePayload as AxiosError),
          deleteListElementsFailure(errorMessage),
        ]

        expect(mockedStore.getActions()).toEqual(expectedActions)
      })
    })
  })
})
