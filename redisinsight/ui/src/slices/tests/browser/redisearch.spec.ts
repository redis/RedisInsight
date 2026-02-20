import { AxiosError } from 'axios'
import { cloneDeep, omit } from 'lodash'
import successMessages from 'uiSrc/components/notifications/success-messages'
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
import { stringToBuffer, UTF8ToBuffer } from 'uiSrc/utils'
import { REDISEARCH_LIST_DATA_MOCK } from 'uiSrc/mocks/handlers/browser/redisearchHandlers'
import { SearchHistoryItem, SearchMode } from 'uiSrc/slices/interfaces/keys'
import { fetchKeys, fetchMoreKeys } from 'uiSrc/slices/browser/keys'
import { initialState as initialStateInstances } from 'uiSrc/slices/instances/instances'
import { RedisDefaultModules } from 'uiSrc/slices/interfaces'
import { MOCK_TIMESTAMP } from 'uiSrc/mocks/data/dateNow'
import { IndexDeleteRequestBodyDto } from 'apiSrc/modules/browser/redisearch/dto'
import reducer, {
  initialState,
  loadKeys,
  loadKeysSuccess,
  loadKeysFailure,
  loadMoreKeys,
  loadMoreKeysSuccess,
  loadMoreKeysFailure,
  loadList,
  loadListSuccess,
  loadListFailure,
  setSelectedIndex,
  setLastBatchRedisearchKeys,
  setQueryRedisearch,
  createIndex,
  createIndexSuccess,
  createIndexFailure,
  fetchRedisearchListAction,
  createRedisearchIndexAction,
  redisearchDataSelector,
  redisearchSelector,
  setRedisearchInitialState,
  resetRedisearchKeysData,
  deleteRedisearchKeyFromList,
  editRedisearchKeyFromList,
  editRedisearchKeyTTLFromList,
  loadRediSearchHistory,
  loadRediSearchHistorySuccess,
  loadRediSearchHistoryFailure,
  deleteRediSearchHistory,
  deleteRediSearchHistorySuccess,
  deleteRediSearchHistoryFailure,
  fetchRedisearchHistoryAction,
  deleteRedisearchHistoryAction,
  fetchRedisearchInfoAction,
  deleteRedisearchIndexAction,
  loadKeyIndexes,
  loadKeyIndexesSuccess,
  loadKeyIndexesFailure,
  resetKeyIndexes,
  keyIndexesSelector,
  fetchKeyIndexesAction,
} from '../../browser/redisearch'

let store: typeof mockedStore
let dateNow: jest.SpyInstance<number>
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
}))

describe('redisearch slice', () => {
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

  describe('loadKeys', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, loadKeys())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: {
          redisearch: nextState,
        },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
      expect(redisearchDataSelector(rootState)).toEqual(state.data)
    })
  })

  describe('loadKeysSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange
      const data = {
        total: 249,
        cursor: 228,
        scanned: 228,
        keys: [
          {
            name: stringToBuffer('bull:mail-queue:155'),
            type: 'hash',
            ttl: 2147474450,
            size: 3041,
          },
          {
            name: stringToBuffer('bull:mail-queue:223'),
            type: 'hash',
            ttl: -1,
            size: 3041,
          },
        ],
      }

      const state = {
        ...initialState,
        loading: false,
        error: '',
        data: {
          ...data,
          shardsMeta: {},
          nextCursor: '228',
          lastRefreshTime: Date.now(),
          previousResultCount: data.keys.length,
        },
      }

      // Act
      const nextState = reducer(initialState, loadKeysSuccess([data, false]))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('loadKeysFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
        data: {
          ...initialState.data,
          keys: [],
          nextCursor: '0',
          total: 0,
          scanned: 0,
          shardsMeta: {},
          previousResultCount: 0,
        },
      }

      // Act
      const nextState = reducer(initialState, loadKeysFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })

    it('should not properly set the error if no payload', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: false,
        error: initialState.error,
        data: {
          ...initialState.data,
          keys: [],
          nextCursor: '0',
          total: 0,
          scanned: 0,
          shardsMeta: {},
          previousResultCount: 0,
        },
      }

      // Act
      const nextState = reducer(initialState, loadKeysFailure())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMoreKeys', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
        error: '',
        data: {
          ...initialState.data,
          keys: [],
          nextCursor: '0',
          total: 0,
          scanned: 0,
          shardsMeta: {},
          previousResultCount: 0,
        },
      }

      // Act
      const nextState = reducer(initialState, loadMoreKeys())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMoreKeysSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const data = {
        total: 0,
        cursor: 0,
        shardsMeta: {},
        scanned: 0,
        keys: [
          {
            name: stringToBuffer('bull:mail-queue:155'),
            type: 'hash',
            ttl: 2147474450,
            size: 3041,
          },
          {
            name: stringToBuffer('bull:mail-queue:223'),
            type: 'hash',
            ttl: -1,
            size: 3041,
          },
        ],
      }

      const state = {
        ...initialState,
        loading: false,
        error: '',
        data: {
          ...omit(data, 'cursor'),
          nextCursor: `${data.cursor}`,
          previousResultCount: data.keys.length,
          lastRefreshTime: initialState.data.lastRefreshTime,
        },
      }

      // Act
      const nextState = reducer(initialState, loadMoreKeysSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data = {
        total: 0,
        cursor: '0',
        keys: [],
        scanned: 0,
        shardsMeta: {},
      }

      // Act
      const nextState = reducer(initialState, loadMoreKeysSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(initialState)
    })
  })

  describe('loadMoreKeysFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
        data: {
          ...initialState.data,
          keys: [],
          nextCursor: '0',
          total: 0,
          scanned: 0,
          shardsMeta: {},
          previousResultCount: 0,
        },
      }

      // Act
      const nextState = reducer(initialState, loadMoreKeysFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })

    it('should not properly set the error if no payload', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: false,
        error: initialState.error,
        data: {
          ...initialState.data,
          keys: [],
          nextCursor: '0',
          total: 0,
          scanned: 0,
          shardsMeta: {},
          previousResultCount: 0,
        },
      }

      // Act
      const nextState = reducer(initialState, loadMoreKeysFailure())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('loadList', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        list: {
          ...initialState.list,
          loading: true,
        },
      }

      // Act
      const nextState = reducer(initialState, loadList())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: {
          redisearch: nextState,
        },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
      expect(redisearchDataSelector(rootState)).toEqual(state.data)
    })
  })

  describe('loadListSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange
      const data = REDISEARCH_LIST_DATA_MOCK
      const state = {
        ...initialState,
        list: {
          data,
          error: '',
          loading: false,
        },
      }

      // Act
      const nextState = reducer(initialState, loadListSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: {
          redisearch: nextState,
        },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
      expect(redisearchDataSelector(rootState)).toEqual(state.data)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data: any[] = []

      const state = {
        ...initialState,
        list: {
          data,
          error: '',
          loading: false,
        },
      }

      // Act
      const nextState = reducer(initialState, loadListSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: {
          redisearch: nextState,
        },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
      expect(redisearchDataSelector(rootState)).toEqual(state.data)
    })
  })

  describe('loadListFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        list: {
          data: [],
          loading: false,
          error: data,
        },
      }

      // Act
      const nextState = reducer(initialState, loadListFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: {
          redisearch: nextState,
        },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
      expect(redisearchDataSelector(rootState)).toEqual(state.data)
    })
  })

  describe('setSelectedIndex', () => {
    it('should properly set the selected index', () => {
      // Arrange

      const index = stringToBuffer('idx')
      const state = {
        ...initialState,
        selectedIndex: index,
      }

      // Act
      const nextState = reducer(initialState, setSelectedIndex(index))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('setQueryRedisearch', () => {
    it('should properly set the selected index', () => {
      // Arrange

      const query = 'query'
      const state = {
        ...initialState,
        search: query,
      }

      // Act
      const nextState = reducer(initialState, setQueryRedisearch(query))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('setLastBatchKeys', () => {
    it('should properly set the state', () => {
      // Arrange
      const strToKey = (name: string) => ({
        name,
        nameString: name,
        ttl: 1,
        size: 1,
        type: 'hash',
      })
      const data = ['44', '55', '66'].map(strToKey)

      const state = {
        ...initialState,
        data: {
          ...initialState.data,
          keys: ['1', '2', '3', '44', '55', '66'].map(strToKey),
        },
      }

      const prevState = {
        ...initialState,
        data: {
          ...initialState.data,
          keys: ['1', '2', '3', '4', '5', '6'].map(strToKey),
        },
      }

      // Act
      const nextState = reducer(prevState, setLastBatchRedisearchKeys(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('createIndex', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        createIndex: {
          ...initialState.createIndex,
          loading: true,
          error: '',
        },
      }

      // Act
      const nextState = reducer(initialState, createIndex())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: {
          redisearch: nextState,
        },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('createIndexSuccess', () => {
    it('should properly set the state', () => {
      // Arrange
      const state = {
        ...initialState,
        createIndex: {
          ...initialState.createIndex,
          loading: false,
        },
      }

      // Act
      const nextState = reducer(initialState, createIndexSuccess())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('loadKeysFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        createIndex: {
          ...initialState.createIndex,
          loading: false,
          error: data,
        },
      }

      // Act
      const nextState = reducer(initialState, createIndexFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('resetRedisearchKeysData', () => {
    it('should reset keys data', () => {
      const strToKey = (name: string) => ({
        name,
        nameString: name,
        ttl: 1,
        size: 1,
        type: 'hash',
      })

      // Arrange
      const state = {
        ...initialState,
        data: {
          ...initialState.data,
          keys: [],
        },
      }

      const prevState = {
        ...initialState,
        data: {
          ...initialState.data,
          keys: ['1', '2', '3', '4', '5', '6'].map(strToKey),
        },
      }

      // Act
      const nextState = reducer(prevState, resetRedisearchKeysData())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteRedisearchKeyFromList', () => {
    it('should delete keys from list', () => {
      const scanned = 5
      const total = 5
      const strToKey = (name: string) => ({
        name: stringToBuffer(name),
        nameString: name,
        ttl: 1,
        size: 1,
        type: 'hash',
      })

      // Arrange
      const state = {
        ...initialState,
        data: {
          ...initialState.data,
          keys: ['1', '2', '3', '5', '6'].map(strToKey),
          scanned: scanned - 1,
          total: total - 1,
        },
      }

      const prevState = {
        ...initialState,
        data: {
          ...initialState.data,
          scanned,
          total,
          keys: ['1', '2', '3', '4', '5', '6'].map(strToKey),
        },
      }

      // Act
      const nextState = reducer(
        prevState,
        deleteRedisearchKeyFromList(strToKey('4')?.name),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('editRedisearchKeyFromList', () => {
    it('should rename key in the list', () => {
      const strToKey = (name: string) => ({
        name: stringToBuffer(name),
        nameString: name,
        ttl: 1,
        size: 1,
        type: 'hash',
      })

      // Arrange
      const state = {
        ...initialState,
        data: {
          ...initialState.data,
          keys: ['1', '2', '3', '44', '5', '6'].map(strToKey),
        },
      }

      const prevState = {
        ...initialState,
        data: {
          ...initialState.data,
          keys: ['1', '2', '3', '4', '5', '6'].map(strToKey),
        },
      }

      // Act
      const nextState = reducer(
        prevState,
        editRedisearchKeyFromList({
          key: strToKey('4')?.name,
          newKey: strToKey('44')?.name,
        }),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('editRedisearchKeyTTLFromList', () => {
    it('should properly set the state before the edit key ttl', () => {
      // Arrange

      const key = UTF8ToBuffer('key')
      const ttl = 12000

      const prevState = {
        ...initialState,
        data: {
          ...initialState.data,
          keys: [{ name: key }],
        },
      }
      const state = {
        ...initialState,
        data: {
          ...initialState.data,
          keys: [{ name: key, ttl }],
        },
      }

      // Act
      const nextState = reducer(
        prevState,
        editRedisearchKeyTTLFromList([key, ttl]),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('loadRediSearchHistory', () => {
    it('should properly set state', () => {
      // Arrange
      const state = {
        ...initialState,
        searchHistory: {
          ...initialState.searchHistory,
          loading: true,
        },
      }

      // Act
      const nextState = reducer(state, loadRediSearchHistory())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('loadRediSearchHistorySuccess', () => {
    it('should properly set state', () => {
      // Arrange
      const data: SearchHistoryItem[] = [
        {
          id: '1',
          mode: SearchMode.Redisearch,
          filter: { type: 'list', match: '*' },
        },
      ]
      const state = {
        ...initialState,
        searchHistory: {
          ...initialState.searchHistory,
          loading: false,
          data,
        },
      }

      // Act
      const nextState = reducer(state, loadRediSearchHistorySuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('loadRediSearchHistoryFailure', () => {
    it('should properly set state', () => {
      // Arrange
      const state = {
        ...initialState,
        searchHistory: {
          ...initialState.searchHistory,
          loading: false,
        },
      }

      // Act
      const nextState = reducer(state, loadRediSearchHistoryFailure())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteRediSearchHistory', () => {
    it('should properly set state', () => {
      // Arrange
      const state = {
        ...initialState,
        searchHistory: {
          ...initialState.searchHistory,
          loading: true,
        },
      }

      // Act
      const nextState = reducer(state, deleteRediSearchHistory())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteRediSearchHistorySuccess', () => {
    it('should properly set state', () => {
      // Arrange
      const data: SearchHistoryItem[] = [
        {
          id: '1',
          mode: SearchMode.Redisearch,
          filter: { type: 'list', match: '*' },
        },
        {
          id: '2',
          mode: SearchMode.Redisearch,
          filter: { type: 'list', match: '*' },
        },
      ]
      const currentState = {
        ...initialState,
        searchHistory: {
          ...initialState.searchHistory,
          loading: false,
          data,
        },
      }

      const state = {
        ...initialState,
        searchHistory: {
          ...initialState.searchHistory,
          loading: false,
          data: [
            {
              id: '1',
              mode: SearchMode.Redisearch,
              filter: { type: 'list', match: '*' },
            },
          ],
        },
      }

      // Act
      const nextState = reducer(
        currentState,
        deleteRediSearchHistorySuccess(['2']),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteRediSearchHistoryFailure', () => {
    it('should properly set state', () => {
      // Arrange
      const state = {
        ...initialState,
        searchHistory: {
          ...initialState.searchHistory,
          loading: false,
        },
      }

      // Act
      const nextState = reducer(state, deleteRediSearchHistoryFailure())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { redisearch: nextState },
      })
      expect(redisearchSelector(rootState)).toEqual(state)
    })
  })

  describe('thunks', () => {
    describe('fetchRedisearchListAction', () => {
      it('call both fetchRedisearchListAction, loadListSuccess when fetch is successed', async () => {
        // Arrange
        const data = REDISEARCH_LIST_DATA_MOCK
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchRedisearchListAction())

        // Assert
        const expectedActions = [
          loadList(),
          loadListSuccess(responsePayload.data.indexes),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchRedisearchKeysAction', () => {
      it('call both loadKeys and loadKeysSuccess when fetch is successed', async () => {
        // Arrange
        const data = {
          total: 10,
          cursor: 20,
          scanned: 20,
          keys: [
            {
              name: stringToBuffer('bull:mail-queue:155'),
              type: 'hash',
              ttl: 2147474450,
              size: 3041,
            },
            {
              name: stringToBuffer('bull:mail-queue:223'),
              type: 'hash',
              ttl: -1,
              size: 3041,
            },
          ],
        }
        const responsePayload = {
          data: {
            total: data.total,
            scanned: data.scanned,
            cursor: 20,
            keys: [...data.keys],
          },
          status: 200,
        }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        const newStore = mockStore({
          ...initialStateDefault,
          connections: {
            instances: {
              ...cloneDeep(initialStateInstances),
              connectedInstance: {
                modules: [{ name: RedisDefaultModules.Search }],
              },
            },
          },
        })

        // Act
        await newStore.dispatch<any>(
          fetchKeys({
            searchMode: SearchMode.Redisearch,
            cursor: '0',
            count: 20,
          }),
        )

        // Assert
        const expectedActions = [loadKeys(), loadKeysSuccess([data, false])]
        expect(newStore.getActions()).toEqual(expectedActions)
      })

      it('failed to load keys', async () => {
        // Arrange
        const errorMessage = 'some error'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        const newStore = mockStore({
          ...initialStateDefault,
          connections: {
            instances: {
              ...cloneDeep(initialStateInstances),
              connectedInstance: {
                modules: [{ name: RedisDefaultModules.Search }],
              },
            },
          },
        })

        // Act
        await newStore.dispatch<any>(
          fetchKeys({
            searchMode: SearchMode.Redisearch,
            cursor: '0',
            count: 20,
          }),
        )

        // Assert
        const expectedActions = [
          loadKeys(),
          addErrorNotification(responsePayload as AxiosError),
          loadKeysFailure(errorMessage),
        ]
        expect(newStore.getActions()).toEqual(expectedActions)
      })

      it('failed to load keys: Index not found', async () => {
        // Arrange
        const errorMessage = 'idx: no such index'
        const responsePayload = {
          response: {
            status: 404,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        const newStore = mockStore({
          ...initialStateDefault,
          connections: {
            instances: {
              ...cloneDeep(initialStateInstances),
              connectedInstance: {
                modules: [{ name: RedisDefaultModules.Search }],
              },
            },
          },
        })

        // Act
        await newStore.dispatch<any>(
          fetchKeys({
            searchMode: SearchMode.Redisearch,
            cursor: '0',
            count: 20,
          }),
        )

        // Assert
        const expectedActions = [
          loadKeys(),
          addErrorNotification(responsePayload as AxiosError),
          loadKeysFailure(errorMessage),
          setRedisearchInitialState(),
          loadList(),
          loadListSuccess(REDISEARCH_LIST_DATA_MOCK.indexes),
        ]
        expect(newStore.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchMoreRedisearchKeysAction', () => {
      it('call both loadMoreKeys and loadMoreKeysSuccess when fetch is successed', async () => {
        // Arrange
        const data = {
          total: 0,
          nextCursor: '0',
          scanned: 20,
          shardsMeta: {},
          keys: [
            {
              name: stringToBuffer('bull:mail-queue:155'),
              type: 'hash',
              ttl: 2147474450,
              size: 3041,
            },
            {
              name: stringToBuffer('bull:mail-queue:223'),
              type: 'hash',
              ttl: -1,
              size: 3041,
            },
          ],
        }

        const responsePayload = {
          data: {
            total: data.total,
            scanned: data.scanned,
            cursor: 20,
            keys: [...data.keys],
          },
          status: 200,
        }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          fetchMoreKeys(SearchMode.Redisearch, [], '0', 20),
        )

        // Assert
        const expectedActions = [
          loadMoreKeys(),
          loadMoreKeysSuccess(responsePayload.data),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch more keys', async () => {
        // Arrange
        const errorMessage = 'some error'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          fetchMoreKeys(SearchMode.Redisearch, [], '0', 20),
        )

        // Assert
        const expectedActions = [
          loadMoreKeys(),
          addErrorNotification(responsePayload as AxiosError),
          loadMoreKeysFailure(errorMessage),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('createRedisearchIndexAction', () => {
      it('should call proper actions on success', async () => {
        // Arrange
        const data = {
          index: stringToBuffer('index'),
          type: 'hash',
          prefixes: ['prefix1', 'prefix 2'].map((p) => stringToBuffer(p)),
          fields: [{ name: stringToBuffer('field'), type: 'numeric' }],
        }

        const responsePayload = { status: 200 }
        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(createRedisearchIndexAction(data))

        // Assert
        const expectedActions = [
          createIndex(),
          createIndexSuccess(),
          addMessageNotification(successMessages.CREATE_INDEX()),
          loadList(),
          loadListSuccess(REDISEARCH_LIST_DATA_MOCK.indexes),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to create index', async () => {
        // Arrange
        const errorMessage = 'some error'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(createRedisearchIndexAction({}))

        // Assert
        const expectedActions = [
          createIndex(),
          addErrorNotification(responsePayload as AxiosError),
          createIndexFailure(errorMessage),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchRedisearchHistoryAction', () => {
      it('success fetch history', async () => {
        // Arrange
        const data: SearchHistoryItem[] = [
          {
            id: '1',
            mode: SearchMode.Redisearch,
            filter: { type: 'list', match: '*' },
          },
          {
            id: '2',
            mode: SearchMode.Redisearch,
            filter: { type: 'list', match: '*' },
          },
        ]
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchRedisearchHistoryAction())

        // Assert
        const expectedActions = [
          loadRediSearchHistory(),
          loadRediSearchHistorySuccess(data),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
      it('failed to load history', async () => {
        // Arrange
        const errorMessage = 'some error'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchRedisearchHistoryAction())

        // Assert
        const expectedActions = [
          loadRediSearchHistory(),
          loadRediSearchHistoryFailure(),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('deleteRedisearchHistoryAction', () => {
      it('success delete history', async () => {
        // Arrange
        const responsePayload = { status: 200 }

        apiService.delete = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(deleteRedisearchHistoryAction(['1']))

        // Assert
        const expectedActions = [
          deleteRediSearchHistory(),
          deleteRediSearchHistorySuccess(['1']),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to delete history', async () => {
        // Arrange
        const errorMessage = 'some error'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.delete = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(deleteRedisearchHistoryAction(['1']))

        // Assert
        const expectedActions = [
          deleteRediSearchHistory(),
          deleteRediSearchHistoryFailure(),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchRedisearchInfoAction', () => {
      it('success fetch info', async () => {
        // Arrange
        const responsePayload = { status: 200 }
        const onSuccess = jest.fn()

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchRedisearchInfoAction('index', onSuccess))

        expect(onSuccess).toBeCalled()
      })

      it('failed to delete history', async () => {
        // Arrange
        const onFailed = jest.fn()
        const errorMessage = 'some error'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          fetchRedisearchInfoAction('index', undefined, onFailed),
        )

        // Assert
        expect(onFailed).toBeCalled()
      })
    })

    describe('deleteRedisearchIndexAction', () => {
      const indexName = 'index'
      const deleteIndexRequestPayload: IndexDeleteRequestBodyDto = {
        index: indexName,
      }

      const mockSuccessCallback = jest.fn()
      const mockErrorCallback = jest.fn()

      beforeEach(() => {
        store.clearActions()
        jest.clearAllMocks()
      })

      it('should delete index successfully', async () => {
        // Arrange
        const responsePayload = { status: 204 }
        const listResponsePayload = {
          data: REDISEARCH_LIST_DATA_MOCK,
          status: 200,
        }

        apiService.delete = jest.fn().mockResolvedValue(responsePayload)
        apiService.get = jest.fn().mockResolvedValue(listResponsePayload)

        // Act
        await store.dispatch<any>(
          deleteRedisearchIndexAction(
            deleteIndexRequestPayload,
            mockSuccessCallback,
            mockErrorCallback,
          ),
        )

        // Assert
        const expectedActions = [
          addMessageNotification(successMessages.DELETE_INDEX(indexName)),
          loadList(),
          loadListSuccess(REDISEARCH_LIST_DATA_MOCK.indexes),
        ]
        expect(store.getActions()).toEqual(expectedActions)
        expect(mockSuccessCallback).toHaveBeenCalled()
        expect(mockErrorCallback).not.toHaveBeenCalled()
      })

      it('should fail to delete index', async () => {
        // Arrange
        const errorMessage = 'Mock error message'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.delete = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          deleteRedisearchIndexAction(
            deleteIndexRequestPayload,
            mockSuccessCallback,
            mockErrorCallback,
          ),
        )

        // Assert
        const expectedActions = [
          {
            type: 'notifications/addErrorNotification',
            payload: responsePayload,
          },
        ]
        expect(store.getActions()).toEqual(expectedActions)
        expect(mockSuccessCallback).not.toHaveBeenCalled()
        expect(mockErrorCallback).toHaveBeenCalled()
      })
    })

    describe('fetchKeyIndexesAction', () => {
      it('should dispatch loadKeyIndexes and loadKeyIndexesSuccess on success', async () => {
        const keyName = 'movie:1'
        const responseData = {
          indexes: [
            { name: 'idx:movie', prefixes: ['movie:'], key_type: 'HASH' },
          ],
        }
        const responsePayload = { data: responseData, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        await store.dispatch<any>(fetchKeyIndexesAction(keyName))

        const expectedActions = [
          loadKeyIndexes(keyName),
          loadKeyIndexesSuccess([
            keyName,
            [{ name: 'idx:movie', prefixes: ['movie:'], keyType: 'HASH' }],
          ]),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('should dispatch loadKeyIndexesFailure on error', async () => {
        const keyName = 'movie:1'
        const errorMessage = 'Request failed with status code 500'
        apiService.post = jest
          .fn()
          .mockRejectedValue(new AxiosError(errorMessage))

        await store.dispatch<any>(fetchKeyIndexesAction(keyName))

        const actions = store.getActions()
        expect(actions[0]).toEqual(loadKeyIndexes(keyName))
        expect(actions[1].type).toEqual(loadKeyIndexesFailure.type)
        expect(actions[1].payload[0]).toEqual(keyName)
      })

      it('should not dispatch when entry is already loaded', async () => {
        const keyName = 'movie:1'
        const storeWithEntry = mockStore({
          ...initialStateDefault,
          browser: {
            ...initialStateDefault.browser,
            redisearch: {
              ...initialState,
              keyIndexes: {
                [keyName]: {
                  loading: false,
                  data: [
                    {
                      name: 'idx:movie',
                      prefixes: ['movie:'],
                      keyType: 'HASH',
                    },
                  ],
                  error: '',
                },
              },
            },
          },
        })

        await storeWithEntry.dispatch<any>(fetchKeyIndexesAction(keyName))

        expect(storeWithEntry.getActions()).toEqual([])
      })

      it('should re-fetch when force=true even if already loaded', async () => {
        const keyName = 'movie:1'
        const responseData = {
          indexes: [
            { name: 'idx:movie', prefixes: ['movie:'], key_type: 'HASH' },
          ],
        }
        apiService.post = jest
          .fn()
          .mockResolvedValue({ data: responseData, status: 200 })

        const storeWithEntry = mockStore({
          ...initialStateDefault,
          browser: {
            ...initialStateDefault.browser,
            redisearch: {
              ...initialState,
              keyIndexes: {
                [keyName]: {
                  loading: false,
                  data: [
                    {
                      name: 'idx:movie',
                      prefixes: ['movie:'],
                      keyType: 'HASH',
                    },
                  ],
                  error: '',
                },
              },
            },
          },
        })

        await storeWithEntry.dispatch<any>(fetchKeyIndexesAction(keyName, true))

        expect(storeWithEntry.getActions().length).toBeGreaterThan(0)
        expect(storeWithEntry.getActions()[0]).toEqual(loadKeyIndexes(keyName))
      })
    })
  })

  describe('keyIndexes reducers', () => {
    describe('loadKeyIndexes', () => {
      it('should set loading state for a key', () => {
        const nextState = reducer(initialState, loadKeyIndexes('movie:1'))

        const rootState = Object.assign(initialStateDefault, {
          browser: { redisearch: nextState },
        })
        const entry = keyIndexesSelector(rootState)['movie:1']
        expect(entry.loading).toBe(true)
        expect(entry.data).toEqual([])
        expect(entry.error).toBe('')
      })
    })

    describe('loadKeyIndexesSuccess', () => {
      it('should set data for a key', () => {
        const indexes = [
          { name: 'idx:movie', prefixes: ['movie:'], keyType: 'HASH' },
        ]
        const nextState = reducer(
          initialState,
          loadKeyIndexesSuccess(['movie:1', indexes]),
        )

        const rootState = Object.assign(initialStateDefault, {
          browser: { redisearch: nextState },
        })
        const entry = keyIndexesSelector(rootState)['movie:1']
        expect(entry.loading).toBe(false)
        expect(entry.data).toEqual(indexes)
        expect(entry.error).toBe('')
      })
    })

    describe('loadKeyIndexesFailure', () => {
      it('should set error for a key', () => {
        const nextState = reducer(
          initialState,
          loadKeyIndexesFailure(['movie:1', 'Failed to fetch']),
        )

        const rootState = Object.assign(initialStateDefault, {
          browser: { redisearch: nextState },
        })
        const entry = keyIndexesSelector(rootState)['movie:1']
        expect(entry.loading).toBe(false)
        expect(entry.data).toEqual([])
        expect(entry.error).toBe('Failed to fetch')
      })
    })

    describe('resetKeyIndexes', () => {
      it('should clear all key indexes', () => {
        const stateWithData = reducer(
          initialState,
          loadKeyIndexesSuccess([
            'movie:1',
            [{ name: 'idx:movie', prefixes: ['movie:'], keyType: 'HASH' }],
          ]),
        )
        const nextState = reducer(stateWithData, resetKeyIndexes())

        const rootState = Object.assign(initialStateDefault, {
          browser: { redisearch: nextState },
        })
        expect(keyIndexesSelector(rootState)).toEqual({})
      })
    })
  })
})
