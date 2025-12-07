import { cloneDeep } from 'lodash'
import { AxiosError } from 'axios'
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
} from 'uiSrc/slices/app/notifications'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { stringToBuffer } from 'uiSrc/utils'
import { deleteRedisearchKeyFromList } from 'uiSrc/slices/browser/redisearch'
import { MOCK_TIMESTAMP } from 'uiSrc/mocks/data/dateNow'
import {
  defaultSelectedKeyAction,
  deleteSelectedKeySuccess,
  refreshKeyInfo,
  updateSelectedKeyRefreshTime,
} from '../../browser/keys'
import reducer, {
  initialState,
  loadMoreSetMembers,
  loadMoreSetMembersFailure,
  loadMoreSetMembersSuccess,
  loadSetMembers,
  loadSetMembersFailure,
  loadSetMembersSuccess,
  addSetMembers,
  addSetMembersSuccess,
  addSetMembersFailure,
  removeMembersFromList,
  removeSetMembers,
  removeSetMembersFailure,
  removeSetMembersSuccess,
  setSelector,
  fetchSetMembers,
  fetchMoreSetMembers,
  addSetMembersAction,
  deleteSetMembers,
} from '../../browser/set'

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

describe('set slice', () => {
  beforeAll(() => {
    dateNow = jest.spyOn(Date, 'now').mockImplementation(() => MOCK_TIMESTAMP)
  })

  afterAll(() => {
    dateNow.mockRestore()
  })

  describe('reducer, actions and selectors', () => {
    it('should return the initial state on first run', () => {
      // Arrange
      const nextState = initialState

      // Act
      const result = reducer(undefined, {})

      // Assert
      expect(result).toEqual(nextState)
    })
  })

  describe('loadSetMembers', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, loadSetMembers(['', undefined]))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { set: nextState },
      }
      expect(setSelector(rootState)).toEqual(state)
    })
  })

  describe('loadSetMembersSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const data = {
        key: 'test set',
        keyName: 'test set',
        ttl: 2147284147,
        total: 1,
        nextCursor: 67,
        members: ['1', '2'],
        match: '*1*',
      }

      const state = {
        loading: false,
        error: '',
        data,
      }

      // Act
      const nextState = reducer(initialState, loadSetMembersSuccess(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { set: nextState },
      }
      expect(setSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data: any = {
        keyName: 'key',
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

      // Act
      const nextState = reducer(initialState, loadSetMembersSuccess(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { set: nextState },
      }
      expect(setSelector(rootState)).toEqual(state)
    })
  })

  describe('loadSetMembersFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        loading: false,
        error: data,
        data: {
          total: 0,
          key: undefined,
          keyName: '',
          members: [],
          nextCursor: 0,
          match: '*',
        },
      }

      // Act
      const nextState = reducer(initialState, loadSetMembersFailure(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { set: nextState },
      }
      expect(setSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMoreSetMembers', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        loading: true,
        error: '',
        data: {
          total: 0,
          key: undefined,
          keyName: '',
          members: [],
          nextCursor: 0,
          match: '*',
        },
      }

      // Act
      const nextState = reducer(initialState, loadMoreSetMembers())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { set: nextState },
      }
      expect(setSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMoreSetMembersSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const data = {
        key: undefined,
        keyName: '',
        nextCursor: 0,
        total: 0,
        members: ['2', '3'],
        match: '*2*',
      }

      const state = {
        loading: false,
        error: '',
        data,
      }

      // Act
      const nextState = reducer(initialState, loadMoreSetMembersSuccess(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { set: nextState },
      }
      expect(setSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data = {
        keyName: 'test set',
        ttl: -1,
        total: 10,
        nextCursor: 67,
        members: [],
      }

      const state = {
        ...initialState,
        loading: false,
        data: {
          ...initialState.data,
          ...data,
        },
      }

      // Act
      const nextState = reducer(initialState, loadMoreSetMembersSuccess(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { set: nextState },
      }
      expect(setSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMoreSetMembersFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        loading: false,
        error: data,
        data: {
          total: 0,
          key: undefined,
          keyName: '',
          members: [],
          nextCursor: 0,
          match: '*',
        },
      }

      // Act
      const nextState = reducer(initialState, loadMoreSetMembersFailure(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { set: nextState },
      }
      expect(setSelector(rootState)).toEqual(state)
    })
  })

  describe('addSetMembers', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, addSetMembers())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { set: nextState },
      }
      expect(setSelector(rootState)).toEqual(state)
    })
  })

  describe('addSetMembersSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: false,
      }

      // Act
      const nextState = reducer(initialState, addSetMembersSuccess())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { set: nextState },
      }
      expect(setSelector(rootState)).toEqual(state)
    })
  })

  describe('addSetMembersFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
      }

      // Act
      const nextState = reducer(initialState, addSetMembersFailure(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { set: nextState },
      }
      expect(setSelector(rootState)).toEqual(state)
    })
  })

  describe('removeSetMembers', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, removeSetMembers())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { set: nextState },
      }
      expect(setSelector(rootState)).toEqual(state)
    })
  })

  describe('removeSetMembersSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const initailStateRemove = {
        ...initialState,
        data: {
          ...initialState.data,
          members: ['1', '2', '3'],
        },
      }

      // Act
      const nextState = reducer(initailStateRemove, removeSetMembersSuccess())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { set: nextState },
      }
      expect(setSelector(rootState)).toEqual(initailStateRemove)
    })
  })

  describe('removeSetMembersFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        loading: false,
        error: data,
        data: {
          total: 0,
          key: undefined,
          keyName: '',
          members: [],
          nextCursor: 0,
          match: '*',
        },
      }

      // Act
      const nextState = reducer(initialState, removeSetMembersFailure(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { set: nextState },
      }
      expect(setSelector(rootState)).toEqual(state)
    })
  })

  describe('removeMembersFromList', () => {
    it('should properly set the error', () => {
      // Arrange
      const initialStateRemove = {
        ...initialState,
        data: {
          ...initialState.data,
          members: ['1', '2', '3'].map((member) => stringToBuffer(member)),
        },
      }

      const data = ['1', '3'].map((member) => stringToBuffer(member))

      const state = {
        ...initialStateRemove,
        data: {
          ...initialStateRemove.data,
          total: initialStateRemove.data.total - 1,
          members: [stringToBuffer('2')],
        },
      }

      // Act
      const nextState = reducer(initialStateRemove, removeMembersFromList(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { set: nextState },
      }
      expect(setSelector(rootState)).toEqual(state)
    })
  })

  describe('thunks', () => {
    describe('fetchSetMembers', () => {
      // Arrange
      const data = {
        keyName: 'small set',
        nextCursor: 0,
        members: ['123', '123', '1'],
        total: 3,
        match: '*',
      }
      it('call fetchSetMembers, loadSetMembersSuccess when fetch is successed', async () => {
        // Arrange
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchSetMembers(data.keyName, 0, 20, '*'))

        // Assert
        const expectedActions = [
          loadSetMembers([data.match, undefined]),
          loadSetMembersSuccess(responsePayload.data),
          updateSelectedKeyRefreshTime(Date.now()),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
      it('failed to fetch Set members', async () => {
        // Arrange
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }
        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchSetMembers(data.keyName, 0, 20, '*'))

        // Assert
        const expectedActions = [
          loadSetMembers(['*', undefined]),
          addErrorNotification(responsePayload as AxiosError),
          loadSetMembersFailure(errorMessage),
        ]

        expect(mockedStore.getActions()).toEqual(expectedActions)
      })
    })
  })

  describe('fetchMoreSetMembers', () => {
    // Arrange
    const data = {
      keyName: 'small set',
      nextCursor: 0,
      members: ['123', '123', '1'],
      total: 3,
    }
    it('call fetchMoreSetMembers, loadMoreSetMembersSuccess when fetch is successed', async () => {
      const responsePayload = { data, status: 200 }

      apiService.post = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(fetchMoreSetMembers(data.keyName, 0, 20, '*'))

      // Assert
      const expectedActions = [
        loadMoreSetMembers(),
        loadMoreSetMembersSuccess(responsePayload.data),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })
    it('failed to fetch more Set members', async () => {
      // Arrange
      const errorMessage = 'Something was wrong!'
      const responsePayload = {
        response: {
          status: 500,
          data: { message: errorMessage },
        },
      }
      apiService.post = jest.fn().mockRejectedValue(responsePayload)

      // Act
      await store.dispatch<any>(fetchMoreSetMembers(data.keyName, 0, 20, '*'))

      // Assert
      const expectedActions = [
        loadMoreSetMembers(),
        addErrorNotification(responsePayload as AxiosError),
        loadMoreSetMembersFailure(errorMessage),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })
  })

  describe('addSetMembersAction', () => {
    const keyName = 'key'
    const members = ['member1', 'member2']
    it('succeed to add members to set', async () => {
      // Arrange
      const responsePayload = { status: 200 }
      apiService.put = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(
        addSetMembersAction({ keyName, members }, jest.fn),
      )

      // Assert
      const expectedActions = [
        addSetMembers(),
        addSetMembersSuccess(),
        defaultSelectedKeyAction(),
      ]

      expect(store.getActions().slice(0, expectedActions.length)).toEqual(
        expectedActions,
      )
    })
    it('failed to add members to set', async () => {
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
      await store.dispatch<any>(
        addSetMembersAction({ keyName, members }, jest.fn(), jest.fn()),
      )

      // Assert
      const expectedActions = [
        addSetMembers(),
        addErrorNotification(responsePayload as AxiosError),
        addSetMembersFailure(errorMessage),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })
  })

  describe('deleteSetMembers', () => {
    const key = 'key'
    const members = ['123', '123', '1']
    it('call removeSetMembers, removeSetMembersSuccess, and removeMembersFromList when fetch is successed', async () => {
      // Arrange
      const responsePayload = { status: 200, data: { affected: 3 } }

      apiService.delete = jest.fn().mockResolvedValue(responsePayload)
      const nextState = {
        ...initialStateDefault,
        browser: {
          ...initialStateDefault.browser,
          set: {
            ...initialState,
            data: {
              ...initialState.data,
              total: 10,
            },
          },
        },
      }

      const mockedStore = mockStore(nextState)

      // Act
      await mockedStore.dispatch<any>(deleteSetMembers(key, members))

      // Assert
      const expectedActions = [
        removeSetMembers(),
        removeSetMembersSuccess(),
        removeMembersFromList(members),
        refreshKeyInfo(),
        addMessageNotification(
          successMessages.REMOVED_KEY_VALUE(key, members.join(''), 'Member'),
        ),
      ]

      expect(mockedStore.getActions().slice(0, expectedActions.length)).toEqual(
        expectedActions,
      )
    })

    it('succeed to delete all members from set', async () => {
      // Arrange
      const responsePayload = { status: 200, data: { affected: 3 } }

      apiService.delete = jest.fn().mockResolvedValue(responsePayload)
      const nextState = {
        ...initialStateDefault,
        browser: {
          set: {
            ...initialState,
            data: {
              ...initialState.data,
              total: 2,
            },
          },
        },
      }

      const mockedStore = mockStore(nextState)

      // Act
      await mockedStore.dispatch<any>(deleteSetMembers(key, members))

      // Assert
      const expectedActions = [
        removeSetMembers(),
        removeSetMembersSuccess(),
        removeMembersFromList(members),
        deleteSelectedKeySuccess(),
        deleteRedisearchKeyFromList(key),
        addMessageNotification(successMessages.DELETED_KEY(key)),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })

    it('failed to delete member from set', async () => {
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
      await store.dispatch<any>(deleteSetMembers(key, members))

      // Assert
      const expectedActions = [
        removeSetMembers(),
        addErrorNotification(responsePayload as AxiosError),
        removeSetMembersFailure(errorMessage),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })
  })
})
