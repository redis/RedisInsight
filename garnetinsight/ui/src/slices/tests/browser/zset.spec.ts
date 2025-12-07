import { cloneDeep } from 'lodash'
import { AxiosError } from 'axios'
import { SortOrder } from 'uiSrc/constants'
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
  AddMembersToZSetDto,
  ZSetMemberDto,
} from 'apiSrc/modules/browser/z-set/dto'
import {
  defaultSelectedKeyAction,
  deleteSelectedKeySuccess,
  refreshKeyInfo,
  updateSelectedKeyRefreshTime,
} from '../../browser/keys'
import reducer, {
  initialState,
  setZsetInitialState,
  loadZSetMembers,
  loadZSetMembersSuccess,
  loadZSetMembersFailure,
  searchZSetMembers,
  searchZSetMembersSuccess,
  searchZSetMembersFailure,
  searchMoreZSetMembers,
  searchMoreZSetMembersSuccess,
  searchMoreZSetMembersFailure,
  loadMoreZSetMembers,
  loadMoreZSetMembersSuccess,
  loadMoreZSetMembersFailure,
  removeZsetMembers,
  removeZsetMembersSuccess,
  removeZsetMembersFailure,
  removeMembersFromList,
  resetUpdateScore,
  updateScore,
  updateScoreSuccess,
  updateScoreFailure,
  updateMembersInList,
  zsetSelector,
  fetchZSetMembers,
  fetchMoreZSetMembers,
  fetchAddZSetMembers,
  deleteZSetMembers,
  updateZSetMembers,
  fetchSearchZSetMembers,
  fetchSearchMoreZSetMembers,
  refreshZsetMembersAction,
} from '../../browser/zset'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
}))

let store: typeof mockedStore
let dateNow: jest.SpyInstance<number>
const errorMessage = 'some error'

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('zset slice', () => {
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

  describe('setZsetInitialState', () => {
    it('should properly set initial state', () => {
      const nextState = reducer(initialState, setZsetInitialState())
      const rootState = {
        ...initialStateDefault,
        browser: { zset: nextState },
      }
      expect(zsetSelector(rootState)).toEqual(initialState)
    })
  })

  describe('loadZSetMembers', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(
        initialState,
        loadZSetMembers([initialState.data.sortOrder, undefined]),
      )

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { zset: nextState },
      }
      expect(zsetSelector(rootState)).toEqual(state)
    })
  })

  describe('loadZSetMembersSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const data = {
        keyName: 'small zset',
        ttl: 2147284147,
        total: 1,
        size: 67,
        members: [{ name: '1', score: '1' }],
      }

      const state = {
        ...initialState,
        loading: false,
        data: {
          ...initialState.data,
          keyName: data.keyName,
          members: data.members,
          total: data.total,
        },
      }

      // Act
      const nextState = reducer(initialState, loadZSetMembersSuccess(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { zset: nextState },
      }
      expect(zsetSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data = {
        keyName: '',
        members: [],
        total: 0,
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
      const nextState = reducer(initialState, loadZSetMembersSuccess(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { zset: nextState },
      }
      expect(zsetSelector(rootState)).toEqual(state)
    })
  })

  describe('loadZSetMembersFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const state = {
        loading: false,
        searching: false,
        error: errorMessage,
        data: initialState.data,
        updateScore: {
          loading: false,
          error: '',
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        loadZSetMembersFailure(errorMessage),
      )

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { zset: nextState },
      }
      expect(zsetSelector(rootState)).toEqual(state)
    })
  })

  describe('searchZSetMembers', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
        searching: true,
        data: {
          ...initialState.data,
          match: '*',
        },
      }

      // Act
      const nextState = reducer(initialState, searchZSetMembers('*'))
      const rootState = {
        ...initialStateDefault,
        browser: { zset: nextState },
      }
      expect(zsetSelector(rootState)).toEqual(state)
    })
  })

  describe('searchZSetMembersSuccess', () => {
    it('should properly set the state with fetched data', () => {
      const data = {
        keyName: 'zset',
        nextCursor: 0,
        members: [{ name: 'member name', score: 10 }],
        total: 1,
      }

      const state = {
        ...initialState,
        loading: false,
        error: '',
        data: {
          ...initialState.data,
          ...data,
          key: data.keyName,
          match: '',
        },
      }

      // Act
      const nextState = reducer(initialState, searchZSetMembersSuccess(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { zset: nextState },
      }
      expect(zsetSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty members', () => {
      const data = {
        keyName: 'zset',
        nextCursor: 0,
        members: [],
        total: 1,
      }

      const state = {
        ...initialState,
        loading: false,
        error: '',
        data: {
          ...initialState.data,
          ...data,
          key: data.keyName,
          match: '',
        },
      }

      // Act
      const nextState = reducer(initialState, searchZSetMembersSuccess(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { zset: nextState },
      }
      expect(zsetSelector(rootState)).toEqual(state)
    })
  })

  describe('searchZSetMembersFailure', () => {
    it('should properly set the error', () => {
      const state = {
        ...initialState,
        loading: false,
        error: errorMessage,
      }

      // Act
      const nextState = reducer(
        initialState,
        searchZSetMembersFailure(errorMessage),
      )

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { zset: nextState },
      }
      expect(zsetSelector(rootState)).toEqual(state)
    })
  })

  describe('searchMoreZSetMembers', () => {
    it('should properly set the state before the fetch data', () => {
      const data = '*'
      const state = {
        ...initialState,
        loading: true,
        searching: true,
        data: {
          ...initialState.data,
          match: data,
        },
      }

      // Act
      const nextState = reducer(initialState, searchMoreZSetMembers(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { zset: nextState },
      }
      expect(zsetSelector(rootState)).toEqual(state)
    })
  })

  describe('searchMoreZSetMembersSuccess', () => {
    it('should properly set the state with fetched data', () => {
      const data = {
        nextCursor: 0,
        members: [{ name: 'member name', score: 10 }],
        total: 1,
      }
      const state = {
        ...initialState,
        loading: false,
        data: {
          ...initialState.data,
          members: data.members,
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        searchMoreZSetMembersSuccess(data),
      )

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { zset: nextState },
      }
      expect(zsetSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      const data = {
        keyName: 'zset',
        nextCursor: 0,
        members: [],
        total: 0,
      }

      // Act
      const nextState = reducer(
        initialState,
        searchMoreZSetMembersSuccess(data),
      )

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { zset: nextState },
      }
      expect(zsetSelector(rootState)).toEqual(initialState)
    })
  })

  describe('searchMoreZSetMembersFailure', () => {
    it('should properly set the error', () => {
      const state = {
        ...initialState,
        loading: false,
        error: errorMessage,
      }

      // Act
      const nextState = reducer(
        initialState,
        searchMoreZSetMembersFailure(errorMessage),
      )

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { zset: nextState },
      }
      expect(zsetSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMoreZSetMembers', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, loadMoreZSetMembers())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { zset: nextState },
      }
      expect(zsetSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMoreZSetMembersSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const data = {
        key: undefined,
        keyName: '',
        match: '',
        nextCursor: 0,
        total: 0,
        members: [
          { name: '1', score: '1' },
          { name: '12', score: '12' },
          { name: '2', score: '2' },
        ],
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
      const nextState = reducer(initialState, loadMoreZSetMembersSuccess(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { zset: nextState },
      }
      expect(zsetSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data = {
        keyName: 'small zset',
        ttl: -1,
        total: 10,
        size: 67,
        members: [],
      }

      // Act
      const nextState = reducer(initialState, loadMoreZSetMembersSuccess(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { zset: nextState },
      }
      expect(zsetSelector(rootState)).toEqual(initialState)
    })
  })

  describe('loadMoreZSetMembersFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: false,
        error: errorMessage,
      }

      // Act
      const nextState = reducer(
        initialState,
        loadMoreZSetMembersFailure(errorMessage),
      )

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { zset: nextState },
      }
      expect(zsetSelector(rootState)).toEqual(state)
    })
  })

  describe('removeZsetMembers', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, removeZsetMembers())

      // Assert
      const rootSate = {
        ...initialStateDefault,
        browser: { zset: nextState },
      }
      expect(zsetSelector(rootSate)).toEqual(state)
    })
  })

  describe('removeZsetMembersSuccess', () => {
    it('should properly set the state with fetched data', () => {
      const initialStateRemove = {
        ...initialState,
        data: {
          ...initialState.data,
          members: [{ name: 'member name', score: 10 }],
        },
      }

      // Act
      const nextState = reducer(initialStateRemove, removeZsetMembersSuccess())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { zset: nextState },
      }
      expect(zsetSelector(rootState)).toEqual(initialStateRemove)
    })
  })

  describe('removeZsetMembersFailure', () => {
    it('should properly set the error', () => {
      const state = {
        ...initialState,
        loading: false,
        error: errorMessage,
      }

      // Act
      const nextState = reducer(
        initialState,
        removeZsetMembersFailure(errorMessage),
      )

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { zset: nextState },
      }
      expect(zsetSelector(rootState)).toEqual(state)
    })
  })

  describe('removeMembersFromList', () => {
    it('should properly remove members from list', () => {
      // Arrange
      const initialStateRemove = {
        ...initialState,
        data: {
          ...initialState.data,
          members: [
            { name: stringToBuffer('member name'), score: 1 },
            { name: stringToBuffer('member name1'), score: 2 },
            { name: stringToBuffer('member name2'), score: 3 },
          ],
        },
      }

      const data = [
        stringToBuffer('member name'),
        stringToBuffer('member name1'),
      ]

      const state = {
        ...initialStateRemove,
        data: {
          ...initialStateRemove.data,
          total: initialStateRemove.data.total - 1,
          members: [{ name: stringToBuffer('member name2'), score: 3 }],
        },
      }

      // Act
      const nextState = reducer(initialStateRemove, removeMembersFromList(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { zset: nextState },
      }
      expect(zsetSelector(rootState)).toEqual(state)
    })
  })

  describe('updateScore', () => {
    it('should properly set the state while updating a zset score', () => {
      // Arrange
      const state = {
        ...initialState,
        updateScore: {
          ...initialState.updateScore,
          loading: true,
          error: '',
        },
      }

      // Act
      const nextState = reducer(initialState, updateScore())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { zset: nextState },
      }
      expect(zsetSelector(rootState)).toEqual(state)
    })
  })

  describe('updateScoreSuccess', () => {
    it('should properly set the state after successfully updated zset score', () => {
      // Arrange
      const state = {
        ...initialState,
        updateScore: {
          ...initialState.updateScore,
          loading: false,
        },
      }

      // Act
      const nextState = reducer(initialState, updateScoreSuccess())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { zset: nextState },
      }
      expect(zsetSelector(rootState)).toEqual(state)
    })
  })

  describe('updateScoreFailure', () => {
    it('should properly set the state on update zset score failure', () => {
      // Arrange
      const state = {
        ...initialState,
        updateScore: {
          ...initialState.updateScore,
          loading: false,
          error: errorMessage,
        },
      }

      // Act
      const nextState = reducer(initialState, updateScoreFailure(errorMessage))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { zset: nextState },
      }
      expect(zsetSelector(rootState)).toEqual(state)
    })
  })

  describe('resetUpdateScore', () => {
    it('should properly reset the state', () => {
      // Arrange;
      const state = {
        ...initialState,
        updateScore: {
          ...initialState.updateScore,
          loading: false,
          error: '',
        },
      }

      // Act
      const nextState = reducer(initialState, resetUpdateScore())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { zset: nextState },
      }
      expect(zsetSelector(rootState)).toEqual(state)
    })
  })

  describe('updateMembersInList', () => {
    it('should properly update members in list', () => {
      // Arrange
      const initialStateToUpdate = {
        ...initialState,
        data: {
          ...initialState.data,
          members: [
            {
              name: stringToBuffer('name'),
              score: 1,
            },
            {
              name: stringToBuffer('name2'),
              score: 2,
            },
          ],
        },
      }

      const data: ZSetMemberDto[] = [
        {
          name: stringToBuffer('name2'),
          score: 3,
        },
      ]

      const state = {
        ...initialState,
        data: {
          ...initialState.data,
          members: [
            {
              name: stringToBuffer('name'),
              score: 1,
            },
            {
              name: stringToBuffer('name2'),
              score: 3,
            },
          ],
        },
      }

      // Act
      const nextState = reducer(initialStateToUpdate, updateMembersInList(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { zset: nextState },
      }
      expect(zsetSelector(rootState)).toEqual(state)
    })
  })

  describe('thunks', () => {
    describe('fetchZSetMembers', () => {
      it('succeed to fetch zset members', async () => {
        // Arrange
        const data = {
          keyName: 'small zset',
          ttl: 2146616656,
          total: 1,
          size: 67,
          members: [{ name: '1', score: '1' }],
        }
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          fetchZSetMembers(data.keyName, 0, 20, SortOrder.ASC),
        )

        // Assert
        const expectedActions = [
          loadZSetMembers([SortOrder.ASC, undefined]),
          loadZSetMembersSuccess(responsePayload.data),
          updateSelectedKeyRefreshTime(Date.now()),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch zset members', async () => {
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
        await store.dispatch<any>(fetchZSetMembers('', 0, 20, SortOrder.ASC))

        // Assert
        const expectedActions = [
          loadZSetMembers([SortOrder.ASC, undefined]),
          addErrorNotification(responsePayload as AxiosError),
          loadZSetMembersFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchMoreZSetMembers', () => {
      it('succeed to fetch more zset members', async () => {
        // Arrange
        const data = {
          keyName: 'small zset',
          ttl: 2146616656,
          total: 1,
          size: 67,
          members: [{ name: '1', score: '1' }],
        }
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          fetchMoreZSetMembers(data.keyName, 0, 20, SortOrder.ASC),
        )

        // Assert
        const expectedActions = [
          loadMoreZSetMembers(),
          loadMoreZSetMembersSuccess(responsePayload.data),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch more zset members', async () => {
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
        await store.dispatch<any>(
          fetchMoreZSetMembers('', 0, 20, SortOrder.ASC),
        )

        // Assert
        const expectedActions = [
          loadMoreZSetMembers(),
          addErrorNotification(responsePayload as AxiosError),
          loadMoreZSetMembersFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchAddZSetMembers', () => {
      it('succeed to fetch add zset members', async () => {
        // Arrange
        const data: AddMembersToZSetDto = {
          keyName: 'small zset',
          members: [{ name: '1', score: 1 }],
        }
        const responsePayload = { status: 200 }

        apiService.put = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchAddZSetMembers(data, jest.fn()))

        // Assert
        const expectedActions = [
          updateScore(),
          updateScoreSuccess(),
          defaultSelectedKeyAction(),
        ]

        expect(store.getActions().slice(0, expectedActions.length)).toEqual(
          expectedActions,
        )
      })

      it('failed to fetch add zset members', async () => {
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
          fetchAddZSetMembers(
            { keyName: '', members: [] },
            jest.fn(),
            jest.fn(),
          ),
        )

        // Assert
        const expectedActions = [
          updateScore(),
          addErrorNotification(responsePayload as AxiosError),
          updateScoreFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('deleteZSetMembers', () => {
      it('succeed to fetch delete zset members', async () => {
        // Arrange
        const key = 'zset key'
        const members = ['member#1', 'member#2']
        const responsePayload = { status: 200, data: { affected: 2 } }

        apiService.delete = jest.fn().mockResolvedValue(responsePayload)
        const nextState = {
          ...initialStateDefault,
          browser: {
            ...initialStateDefault.browser,
            zset: {
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
        await mockedStore.dispatch<any>(deleteZSetMembers(key, members))

        // Assert
        const expectedActions = [
          removeZsetMembers(),
          removeZsetMembersSuccess(),
          removeMembersFromList(members),
          refreshKeyInfo(),
          addMessageNotification(
            successMessages.REMOVED_KEY_VALUE(key, members.join(''), 'Member'),
          ),
        ]

        expect(
          mockedStore.getActions().slice(0, expectedActions.length),
        ).toEqual(expectedActions)
      })

      it('succeed to fetch delete all zset members', async () => {
        // Arrange
        const key = 'zset key'
        const members = ['member#1', 'member#2']
        const responsePayload = { status: 200, data: { affected: 2 } }

        apiService.delete = jest.fn().mockResolvedValue(responsePayload)
        const nextState = {
          ...initialStateDefault,
          browser: {
            zset: {
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
        await mockedStore.dispatch<any>(deleteZSetMembers(key, members))

        // Assert
        const expectedActions = [
          removeZsetMembers(),
          removeZsetMembersSuccess(),
          removeMembersFromList(members),
          deleteSelectedKeySuccess(),
          deleteRedisearchKeyFromList(key),
          addMessageNotification(successMessages.DELETED_KEY(key)),
        ]

        expect(mockedStore.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch delete zset members', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }
        apiService.delete = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(deleteZSetMembers('key', []))

        // Assert
        const expectedActions = [
          removeZsetMembers(),
          addErrorNotification(responsePayload as AxiosError),
          removeZsetMembersFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('updateZSetMembers', () => {
      it('succeed to fetch update zset members', async () => {
        // Arrange
        const data: AddMembersToZSetDto = {
          keyName: 'small zset',
          members: [{ name: '1', score: 1 }],
        }
        const responsePayload = { status: 200 }

        apiService.put = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(updateZSetMembers(data, jest.fn()))

        // Assert
        const expectedActions = [
          updateScore(),
          updateScoreSuccess(),
          updateMembersInList(data.members),
          refreshKeyInfo(),
        ]

        expect(store.getActions().slice(0, expectedActions.length)).toEqual(
          expectedActions,
        )
      })

      it('failed to fetch update zset members', async () => {
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
          updateZSetMembers({ keyName: '', members: [] }, jest.fn(), jest.fn()),
        )

        // Assert
        const expectedActions = [
          updateScore(),
          addErrorNotification(responsePayload as AxiosError),
          updateScoreFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchSearchZSetMembers', () => {
      it('succeed to fetch search zset members', async () => {
        // Arrange
        const data = { members: [] }
        const responsePayload = { status: 200, data }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchSearchZSetMembers('key', 0, 20, 'zz'))

        // Assert
        const expectedActions = [
          searchZSetMembers('zz'),
          searchZSetMembersSuccess(data),
          updateSelectedKeyRefreshTime(Date.now()),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch search zset members', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }
        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchSearchZSetMembers('key', 0, 20, 'zz'))

        // Assert
        const expectedActions = [
          searchZSetMembers('zz'),
          addErrorNotification(responsePayload as AxiosError),
          searchZSetMembersFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchSearchMoreZSetMembers', () => {
      it('succeed to fetch search more zset members', async () => {
        // Arrange
        const responseData = { members: [] }
        const responsePayload = { status: 200, data: responseData }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          fetchSearchMoreZSetMembers('key', 0, 20, 'zz'),
        )

        // Assert
        const expectedActions = [
          searchMoreZSetMembers('zz'),
          searchMoreZSetMembersSuccess(responseData),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch search more zset members', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }
        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          fetchSearchMoreZSetMembers('key', 0, 20, 'zz'),
        )

        // Assert
        const expectedActions = [
          searchMoreZSetMembers('zz'),
          addErrorNotification(responsePayload as AxiosError),
          searchMoreZSetMembersFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('refreshStringMembersAction', () => {
      it('succeed to fetch zset members after refresh', async () => {
        // Arrange
        const data = {
          keyName: 'small zset',
          ttl: 2146616656,
          total: 1,
          size: 67,
          members: [{ name: '1', score: '1' }],
        }
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(refreshZsetMembersAction(data.keyName))

        // Assert
        const expectedActions = [
          loadZSetMembers([SortOrder.ASC, undefined]),
          loadZSetMembersSuccess(responsePayload.data),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch zset members after refresh', async () => {
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
        await store.dispatch<any>(refreshZsetMembersAction())

        // Assert
        const expectedActions = [
          loadZSetMembers([SortOrder.ASC, undefined]),
          addErrorNotification(responsePayload as AxiosError),
          loadZSetMembersFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('succeed to search zset members after refresh', async () => {
        // Arrange
        const data = { members: [] }
        const responsePayload = { status: 200, data }
        // Act
        const nextState = {
          ...initialStateDefault,
          browser: {
            zset: {
              ...initialState,
              searching: true,
            },
          },
        }
        const mockedStore = mockStore(nextState)

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        await mockedStore.dispatch<any>(refreshZsetMembersAction())

        // Assert
        const expectedActions = [
          searchZSetMembers(''),
          searchZSetMembersSuccess(data),
        ]

        expect(mockedStore.getActions()).toEqual(expectedActions)
      })
    })
  })
})
