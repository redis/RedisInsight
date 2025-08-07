import { cloneDeep } from 'lodash'
import { AxiosError } from 'axios'
import { configureStore } from '@reduxjs/toolkit'
import { getConfig } from 'uiSrc/config'
import {
  BrowserColumns,
  KeyTypes,
  KeyValueFormat,
  ModulesKeyTypes,
} from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import {
  parseKeysListResponse,
  stringToBuffer,
  UTF8ToBuffer,
} from 'uiSrc/utils'
import {
  cleanup,
  clearStoreActions,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import {
  addErrorNotification,
  addMessageNotification,
} from 'uiSrc/slices/app/notifications'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { SearchHistoryItem, SearchMode } from 'uiSrc/slices/interfaces/keys'
import {
  resetBrowserTree,
  setBrowserSelectedKey,
} from 'uiSrc/slices/app/context'
import { MOCK_TIMESTAMP } from 'uiSrc/mocks/data/dateNow'
import {
  setEditorType,
  setIsWithinThreshold,
} from 'uiSrc/slices/browser/rejson'
import { EditorType } from 'uiSrc/slices/interfaces'
import { CreateHashWithExpireDto } from 'apiSrc/modules/browser/hash/dto'
import {
  CreateListWithExpireDto,
  ListElementDestination,
} from 'apiSrc/modules/browser/list/dto'
import { CreateRejsonRlWithExpireDto } from 'apiSrc/modules/browser/rejson-rl/dto'
import { CreateSetWithExpireDto } from 'apiSrc/modules/browser/set/dto'
import { CreateZSetWithExpireDto } from 'apiSrc/modules/browser/z-set/dto'
import { SetStringWithExpireDto } from 'apiSrc/modules/browser/string/dto'
import { rootReducer } from '../../store'
import { getString, getStringSuccess } from '../../browser/string'
import reducer, {
  addHashKey,
  addKey,
  addKeyFailure,
  addKeySuccess,
  addListKey,
  addReJSONKey,
  addSetKey,
  addStringKey,
  addZsetKey,
  defaultSelectedKeyAction,
  defaultSelectedKeyActionFailure,
  defaultSelectedKeyActionSuccess,
  deleteSelectedKey,
  deleteSelectedKeyAction,
  deleteSelectedKeyFailure,
  deleteSelectedKeySuccess,
  deleteKey,
  deleteKeySuccess,
  deleteKeyFailure,
  deleteKeyAction,
  deletePatternHistoryAction,
  deletePatternKeyFromList,
  deleteSearchHistory,
  deleteSearchHistoryAction,
  deleteSearchHistoryFailure,
  deleteSearchHistorySuccess,
  editKey,
  editKeyTTL,
  editPatternKeyFromList,
  editPatternKeyTTLFromList,
  fetchKeyInfo,
  fetchKeys,
  fetchKeysMetadata,
  fetchKeysMetadataTree,
  fetchMoreKeys,
  fetchPatternHistoryAction,
  fetchSearchHistoryAction,
  initialState,
  keysSelector,
  loadKeyInfoSuccess,
  loadKeys,
  loadKeysFailure,
  loadKeysSuccess,
  loadMoreKeys,
  loadMoreKeysFailure,
  loadMoreKeysSuccess,
  loadSearchHistory,
  loadSearchHistoryFailure,
  loadSearchHistorySuccess,
  refreshKeyInfo,
  refreshKeyInfoAction,
  updateKeyList,
  addKeyIntoList,
  refreshKeyInfoFail,
  refreshKeyInfoSuccess,
  resetAddKey,
  resetKeyInfo,
  resetKeys,
  setLastBatchPatternKeys,
  updateSelectedKeyRefreshTime,
  refreshKey,
} from '../../browser/keys'

const riConfig = getConfig()
const REJSON_THRESHOLD = riConfig.browser.rejsonMonacoEditorMaxThreshold

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

describe('keys slice', () => {
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
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('loadKeysSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const data = {
        total: 249,
        nextCursor: '228',
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
          lastRefreshTime: Date.now(),
          previousResultCount: data.keys.length,
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        loadKeysSuccess({ data, isFiltered: false, isSearched: false }),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data: any = {}

      const state = {
        ...initialState,
        loading: false,
        error: '',
        data: {
          ...data,
          previousResultCount: data.keys?.length,
          lastRefreshTime: Date.now(),
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        loadKeysSuccess({ data, isFiltered: false, isSearched: false }),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
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
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
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
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMoreKeysSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const data = {
        total: 0,
        nextCursor: '0',
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
          ...data,
          previousResultCount: data.keys.length,
          lastRefreshTime: initialState.data.lastRefreshTime,
        },
      }

      // Act
      const nextState = reducer(initialState, loadMoreKeysSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data = {
        total: 0,
        nextCursor: '0',
        keys: [],
        scanned: 0,
        shardsMeta: {},
      }

      // Act
      const nextState = reducer(initialState, loadMoreKeysSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(initialState)
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
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('loadKeyInfoSuccess', () => {
    it('should properly set the state', () => {
      // Arrange
      const data = {
        name: stringToBuffer('keyName'),
        nameString: 'keyName',
        type: 'hash',
        ttl: -1,
        size: 279,
      }
      const state = {
        ...initialState,
        selectedKey: {
          ...initialState.selectedKey,
          loading: false,
          isRefreshDisabled: false,
          data: {
            ...data,
          },
        },
      }

      // Act
      const nextState = reducer(initialState, loadKeyInfoSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
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
      const nextState = reducer(prevState, setLastBatchPatternKeys(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('refreshKeyInfo', () => {
    it('should properly set the state', () => {
      // Arrange
      const state = {
        ...initialState,
        selectedKey: {
          ...initialState.selectedKey,
          refreshing: true,
        },
      }

      // Act
      const nextState = reducer(initialState, refreshKeyInfo())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('refreshKeyInfoSuccess', () => {
    it('should properly set the state', () => {
      // Arrange
      const data = {
        name: 'keyName',
        type: 'hash',
        ttl: -1,
        size: 279,
        length: 3,
      }
      const state = {
        ...initialState,
        selectedKey: {
          ...initialState.selectedKey,
          refreshing: false,
          data: { ...initialState.selectedKey.data, ...data },
        },
      }

      // Act
      const nextState = reducer(initialState, refreshKeyInfoSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('refreshKeyInfoFail', () => {
    it('should properly set the state', () => {
      // Arrange
      const state = {
        ...initialState,
        selectedKey: {
          ...initialState.selectedKey,
          refreshing: false,
        },
      }

      // Act
      const nextState = reducer(initialState, refreshKeyInfoFail())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('addKey', () => {
    it('should properly set the state while adding a key', () => {
      // Arrange
      const state = {
        ...initialState,
        addKey: {
          ...initialState.addKey,
          loading: true,
          error: '',
        },
      }

      // Act
      const nextState = reducer(initialState, addKey())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('updateKeyList', () => {
    it('should properly set the state after successfully added key', () => {
      // Arrange
      const state = {
        ...initialState,
        data: {
          ...initialState.data,
          keys: [{ name: 'name' }],
          scanned: 1,
          total: 1,
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        updateKeyList({ keyName: 'name', keyType: 'hash' }),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('addKeyFailure', () => {
    it('should properly set the state on add key failure', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        addKey: {
          ...initialState.addKey,
          loading: false,
          error: data,
        },
      }

      // Act
      const nextState = reducer(initialState, addKeyFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('resetAddKey', () => {
    it('should properly reset the state', () => {
      // Arrange
      const state = {
        ...initialState,
        addKey: {
          ...initialState.addKey,
          loading: false,
          error: '',
        },
      }

      // Act
      const nextState = reducer(initialState, resetAddKey())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteSelectedKey', () => {
    it('should properly set the state before the delete key', () => {
      // Arrange
      const state = {
        ...initialState,
        selectedKey: {
          ...initialState.selectedKey,
          loading: true,
          data: null,
        },
      }

      // Act
      const nextState = reducer(initialState, deleteSelectedKey())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteSelectedKeySuccess', () => {
    it('should properly set the state before the delete key', () => {
      // Arrange
      const state = {
        ...initialState,
        selectedKey: {
          ...initialState.selectedKey,
          loading: false,
          data: null,
        },
      }

      // Act
      const nextState = reducer(initialState, deleteSelectedKeySuccess())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteSelectedKeyFailure', () => {
    it('should properly set the state before the delete key', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        selectedKey: {
          ...initialState.selectedKey,
          loading: false,
          error: data,
        },
      }

      // Act
      const nextState = reducer(initialState, deleteSelectedKeyFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteKey', () => {
    it('should properly set the state before the delete key', () => {
      // Arrange
      const state = {
        ...initialState,
        deleting: true,
      }

      // Act
      const nextState = reducer(initialState, deleteKey())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteKeySuccess', () => {
    it('should properly set the state after the delete key', () => {
      // Arrange
      const currentState = {
        ...initialState,
        deleting: true,
      }
      const state = {
        ...initialState,
        deleting: false,
      }

      // Act
      const nextState = reducer(currentState, deleteKeySuccess())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteKeyFailure', () => {
    it('should properly set the state after the delete key', () => {
      // Arrange
      const currentState = {
        ...initialState,
        deleting: true,
      }
      const state = {
        ...initialState,
        deleting: false,
      }

      // Act
      const nextState = reducer(currentState, deleteKeyFailure())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('defaultSelectedKeyAction', () => {
    it('should properly set the state before the delete key', () => {
      // Arrange
      const state = {
        ...initialState,
        selectedKey: {
          ...initialState.selectedKey,
          loading: true,
          error: '',
        },
      }

      // Act
      const nextState = reducer(initialState, defaultSelectedKeyAction())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('defaultSelectedKeyActionSuccess', () => {
    it('should properly set the state before the delete key', () => {
      // Arrange
      const state = {
        ...initialState,
        selectedKey: {
          ...initialState.selectedKey,
          loading: false,
        },
      }

      // Act
      const nextState = reducer(initialState, defaultSelectedKeyActionSuccess())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('defaultSelectedKeyActionFailure', () => {
    it('should properly set the state before the delete key', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        selectedKey: {
          ...initialState.selectedKey,
          loading: false,
          error: data,
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        defaultSelectedKeyActionFailure(data),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('editPatternKeyFromList', () => {
    it('should properly set the state before the edit key', () => {
      // Arrange

      const data = {
        key: 'test',
        newKey: 'test2',
      }

      const initialStateMock = {
        ...initialState,
        data: {
          keys: [{ name: data.key }],
        },
      }
      const state = {
        ...initialState,
        data: {
          keys: [{ name: data.newKey, nameString: data.newKey }],
        },
      }

      // Act
      const nextState = reducer(initialStateMock, editPatternKeyFromList(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('editPatternKeyTTLFromList', () => {
    it('should properly set the state before the edit key ttl', () => {
      // Arrange

      const key = UTF8ToBuffer('key')
      const ttl = 12000

      const initialStateMock = {
        ...initialState,
        data: {
          keys: [{ name: key }],
        },
      }
      const state = {
        ...initialState,
        data: {
          keys: [{ name: key, ttl }],
        },
      }

      // Act
      const nextState = reducer(
        initialStateMock,
        editPatternKeyTTLFromList([key, ttl]),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('resetKeyInfo', () => {
    it('should properly save viewFormat', () => {
      // Arrange
      const viewFormat = KeyValueFormat.HEX
      const initialStateMock = {
        ...initialState,
        selectedKey: {
          ...initialState.selectedKey,
          viewFormat,
        },
      }

      // Act
      const nextState = reducer(initialStateMock, resetKeyInfo())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(initialStateMock)
    })
  })

  describe('resetKeys', () => {
    it('should properly save viewFormat', () => {
      // Arrange
      const viewFormat = KeyValueFormat.HEX
      const initialStateMock = {
        ...initialState,
        selectedKey: {
          ...initialState.selectedKey,
          viewFormat,
        },
      }

      // Act
      const nextState = reducer(initialStateMock, resetKeys())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(initialStateMock)
    })
  })

  describe('loadSearchHistory', () => {
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
      const nextState = reducer(state, loadSearchHistory())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('loadSearchHistorySuccess', () => {
    it('should properly set state', () => {
      // Arrange
      const data: SearchHistoryItem[] = [
        {
          id: '1',
          mode: SearchMode.Pattern,
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
      const nextState = reducer(state, loadSearchHistorySuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('loadSearchHistoryFailure', () => {
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
      const nextState = reducer(state, loadSearchHistoryFailure())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteSearchHistory', () => {
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
      const nextState = reducer(state, deleteSearchHistory())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteSearchHistorySuccess', () => {
    it('should properly set state', () => {
      // Arrange
      const data: SearchHistoryItem[] = [
        {
          id: '1',
          mode: SearchMode.Pattern,
          filter: { type: 'list', match: '*' },
        },
        {
          id: '2',
          mode: SearchMode.Pattern,
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
              mode: SearchMode.Pattern,
              filter: { type: 'list', match: '*' },
            },
          ],
        },
      }

      // Act
      const nextState = reducer(currentState, deleteSearchHistorySuccess(['2']))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteSearchHistoryFailure', () => {
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
      const nextState = reducer(state, deleteSearchHistoryFailure())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('refreshKey', () => {
    it('defaultSelectedKeyAction should be called by default', async () => {
      const key = stringToBuffer('key')

      // Act
      await store.dispatch<any>(refreshKey(key, ModulesKeyTypes.Graph))

      // Assert
      const expectedActions = [refreshKeyInfo(), defaultSelectedKeyAction()]
      expect(clearStoreActions(store.getActions())).toEqual(
        clearStoreActions(expectedActions),
      )
    })
  })

  describe('thunks', () => {
    describe('fetchKeys', () => {
      it('call both loadKeys and loadKeysSuccess when fetch is successed', async () => {
        // Arrange
        const data = {
          total: 10,
          nextCursor: 20,
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
          data: [
            {
              total: data.total,
              scanned: data.scanned,
              cursor: 20,
              keys: [...data.keys],
            },
          ],
          status: 200,
        }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          fetchKeys({ searchMode: SearchMode.Pattern, cursor: '0', count: 20 }),
        )

        // Assert
        const expectedActions = [
          loadKeys(),
          loadKeysSuccess({
            data: parseKeysListResponse({}, responsePayload.data),
            isFiltered: false,
            isSearched: false,
          }),
        ]
        expect(store.getActions()).toEqual(expectedActions)
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

        // Act
        await store.dispatch<any>(
          fetchKeys({ searchMode: SearchMode.Pattern, cursor: '0', count: 20 }),
        )

        // Assert
        const expectedActions = [
          loadKeys(),
          addErrorNotification(responsePayload as AxiosError),
          loadKeysFailure(errorMessage),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchMoreKeys', () => {
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
          data: [
            {
              total: data.total,
              scanned: data.scanned,
              cursor: 20,
              keys: [...data.keys],
            },
          ],
          status: 200,
        }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          fetchMoreKeys(SearchMode.Pattern, [], '0', 20),
        )

        // Assert
        const expectedActions = [
          loadMoreKeys(),
          loadMoreKeysSuccess(parseKeysListResponse({}, responsePayload.data)),
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
          fetchMoreKeys(SearchMode.Pattern, [], '0', 20),
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

    describe('fetchKeyInfo', () => {
      it('call both defaultSelectedKeyAction and loadKeyInfoSuccess when fetch is successed', async () => {
        // Arrange
        const data = {
          name: stringToBuffer('string'),
          type: KeyTypes.String,
          ttl: -1,
          size: 10,
        }
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchKeyInfo(data.name))

        // Assert
        const expectedActions = [
          defaultSelectedKeyAction(),
          loadKeyInfoSuccess(responsePayload.data),
          updateSelectedKeyRefreshTime(Date.now()),
          // fetch keyInfo
          getString(),
          getStringSuccess(data),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch key info', async () => {
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
        await store.dispatch<any>(fetchKeyInfo('keyName'))

        // Assert
        const expectedActions = [
          defaultSelectedKeyAction(),
          addErrorNotification(responsePayload as AxiosError),
          defaultSelectedKeyActionFailure(errorMessage),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('key info is reset when key not found', async () => {
        // Arrange
        const errorMessage = 'resource not found error'
        const responsePayload = {
          response: {
            status: 404,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchKeyInfo('keyName'))

        // Assert
        const expectedActions = [
          defaultSelectedKeyAction(),
          addErrorNotification(responsePayload as AxiosError),
          defaultSelectedKeyActionFailure(errorMessage),
          resetKeyInfo(),
          setBrowserSelectedKey(null),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('should set default JSON editor', async () => {
        // Arrange
        const data = {
          name: stringToBuffer('rejson'),
          type: KeyTypes.ReJSON,
          ttl: -1,
          size: 10,
        }
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchKeyInfo(data.name))

        // Assert
        expect(store.getActions()).toEqual(
          expect.arrayContaining([
            expect.objectContaining(setEditorType(EditorType.Default)),
          ]),
        )
      })

      it('should set isWithinThreshold to true when length is within threshold', async () => {
        // Arrange
        const data = {
          name: stringToBuffer('rejson'),
          type: KeyTypes.ReJSON,
          ttl: -1,
          size: REJSON_THRESHOLD,
          length: REJSON_THRESHOLD + 100, // just to make sure this isn't used instead of size
        }
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchKeyInfo(data.name))

        // Assert
        expect(store.getActions()).toEqual(
          expect.arrayContaining([
            expect.objectContaining(setIsWithinThreshold(true)),
          ]),
        )
      })

      it('should set isWithinThreshold to false when length exceeds threshold', async () => {
        // Arrange
        const data = {
          name: stringToBuffer('rejson'),
          type: KeyTypes.ReJSON,
          ttl: -1,
          size: REJSON_THRESHOLD + 1,
          length: REJSON_THRESHOLD, // just to make sure this isn't used instead of size
        }
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchKeyInfo(data.name))

        // Assert
        expect(store.getActions()).toEqual(
          expect.arrayContaining([
            expect.objectContaining(setIsWithinThreshold(false)),
          ]),
        )
      })
    })

    describe('refreshKeyInfoAction', () => {
      it('success to refresh key info', async () => {
        // Arrange
        const data = {
          name: stringToBuffer('keyName'),
          type: 'hash',
          ttl: -1,
          size: 279,
        }
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          refreshKeyInfoAction(stringToBuffer('keyName')),
        )

        // Assert
        const expectedActions = [
          refreshKeyInfo(),
          refreshKeyInfoSuccess(responsePayload.data),
          updateSelectedKeyRefreshTime(Date.now()),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to refresh key info', async () => {
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
        await store.dispatch<any>(refreshKeyInfoAction('keyName'))

        // Assert
        const expectedActions = [
          refreshKeyInfo(),
          refreshKeyInfoFail(),
          addErrorNotification(responsePayload as AxiosError),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('addHashKey', () => {
      it('success to add key', async () => {
        // Arrange
        const data: CreateHashWithExpireDto = {
          keyName: 'keyName',
          fields: [{ field: '1', value: '1' }],
        }
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(addHashKey(data, jest.fn()))

        // Assert
        const expectedActions = [
          addKey(),
          addKeySuccess(),
          resetBrowserTree(),
          updateKeyList({ keyName: data.keyName, keyType: 'hash' }),
          addMessageNotification(successMessages.ADDED_NEW_KEY(data.keyName)),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('addHashZset', () => {
      it('success to add key', async () => {
        // Arrange
        const data: CreateZSetWithExpireDto = {
          keyName: 'keyName',
          members: [{ name: '1', score: 1 }],
        }
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(addZsetKey(data, jest.fn()))

        // Assert
        const expectedActions = [
          addKey(),
          addKeySuccess(),
          resetBrowserTree(),
          updateKeyList({ keyName: data.keyName, keyType: 'zset' }),
          addMessageNotification(successMessages.ADDED_NEW_KEY(data.keyName)),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('addHashSet', () => {
      it('success to add key', async () => {
        // Arrange
        const data: CreateSetWithExpireDto = {
          keyName: 'keyName',
          members: ['member'],
        }
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(addSetKey(data, jest.fn()))

        // Assert
        const expectedActions = [
          addKey(),
          addKeySuccess(),
          resetBrowserTree(),
          updateKeyList({ keyName: data.keyName, keyType: 'set' }),
          addMessageNotification(successMessages.ADDED_NEW_KEY(data.keyName)),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('addStringKey', () => {
      it('success to add key', async () => {
        // Arrange
        const data: SetStringWithExpireDto = {
          keyName: 'keyName',
          value: 'string',
        }
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(addStringKey(data, jest.fn()))

        // Assert
        const expectedActions = [
          addKey(),
          addKeySuccess(),
          resetBrowserTree(),
          updateKeyList({ keyName: data.keyName, keyType: 'string' }),
          addMessageNotification(successMessages.ADDED_NEW_KEY(data.keyName)),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('addListKey', () => {
      it('success to add key', async () => {
        // Arrange
        const data: CreateListWithExpireDto = {
          keyName: 'keyName',
          destination: 'TAIL' as ListElementDestination,
          elements: ['1'],
        }
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(addListKey(data, jest.fn()))

        // Assert
        const expectedActions = [
          addKey(),
          addKeySuccess(),
          resetBrowserTree(),
          updateKeyList({ keyName: data.keyName, keyType: 'list' }),
          addMessageNotification(successMessages.ADDED_NEW_KEY(data.keyName)),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('addReJSONKey', () => {
      it('success to add key', async () => {
        // Arrange
        const data: CreateRejsonRlWithExpireDto = {
          keyName: 'keyName',
          data: '{}',
        }
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(addReJSONKey(data, jest.fn()))

        // Assert
        const expectedActions = [
          addKey(),
          addKeySuccess(),
          resetBrowserTree(),
          updateKeyList({ keyName: data.keyName, keyType: 'ReJSON-RL' }),
          addMessageNotification(successMessages.ADDED_NEW_KEY(data.keyName)),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('deleteSelectedKey', () => {
      it('should call proper actions on success', async () => {
        // Arrange
        const data = {
          name: stringToBuffer('string'),
          type: KeyTypes.String,
          ttl: -1,
          size: 10,
        }
        const responsePayload = { data, status: 200 }

        apiService.delete = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(deleteSelectedKeyAction(data.name))

        // Assert
        const expectedActions = [
          deleteSelectedKey(),
          deleteSelectedKeySuccess(),
          deletePatternKeyFromList(data.name),
          addMessageNotification(successMessages.DELETED_KEY(data.name)),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('deleteKey', () => {
      it('should call proper actions on success', async () => {
        // Arrange
        const data = {
          name: stringToBuffer('string'),
          type: KeyTypes.String,
          ttl: -1,
          size: 10,
        }
        const responsePayload = { data, status: 200 }

        apiService.delete = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(deleteKeyAction(data.name))

        // Assert
        const expectedActions = [
          deleteKey(),
          deleteKeySuccess(),
          deletePatternKeyFromList(data.name),
          addMessageNotification(successMessages.DELETED_KEY(data.name)),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('editKey', () => {
      it('call both editKey, editKeySuccess and editPatternKeyFromList when editing is successed', async () => {
        // Arrange
        const key = 'string'
        const newKey = 'string2'
        const responsePayload = { data: newKey, status: 200 }

        apiService.patch = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(editKey(key, newKey))

        // Assert
        const expectedActions = [
          defaultSelectedKeyAction(),
          editPatternKeyFromList({ key, newKey }),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('editKeyTTL', () => {
      it('success editKeyTTL with positive ttl', async () => {
        // Arrange
        const key = 'string'
        const ttl = 1200
        const responsePayload = { status: 200 }

        apiService.patch = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(editKeyTTL(key, ttl))

        // Assert
        const expectedActions = [
          defaultSelectedKeyAction(),
          // fetch keyInfo
          editPatternKeyTTLFromList([key, ttl]),
          defaultSelectedKeyAction(),
          defaultSelectedKeyActionSuccess(),
          loadKeyInfoSuccess({ data: '{}', keyName: 'keyName' }),
          updateSelectedKeyRefreshTime(MOCK_TIMESTAMP),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('success editKeyTTL with ttl = 0', async () => {
        // Arrange
        const key = 'string'
        const ttl = 0
        const responsePayload = { status: 200 }

        apiService.patch = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(editKeyTTL(key, ttl))

        // Assert
        const expectedActions = [
          defaultSelectedKeyAction(),
          deleteSelectedKeySuccess(),
          deletePatternKeyFromList(key),
          defaultSelectedKeyActionSuccess(),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    const shownColumnsTestCases = [
      {
        name: 'size and ttl',
        shownColumns: [BrowserColumns.Size, BrowserColumns.TTL],
      },
      {
        name: 'size only',
        shownColumns: [BrowserColumns.Size],
      },
      {
        name: 'ttl only',
        shownColumns: [BrowserColumns.TTL],
      },
      {
        name: 'no columns',
        shownColumns: [],
      },
    ]
    describe('fetchKeysMetadata', () => {
      shownColumnsTestCases.forEach(({ name, shownColumns }) => {
        it(`success to fetch keys metadata with ${name}`, async () => {
          const initialStateWithColumns = {
            ...initialStateDefault,
            app: {
              context: {
                dbConfig: {
                  shownColumns,
                },
              },
            },
          }

          const testStore = configureStore({
            reducer: rootReducer,
            preloadedState: initialStateWithColumns,
          })

          const data = [
            {
              name: stringToBuffer('key1'),
              type: 'hash',
              ttl: -1,
              size: 100,
              length: 100,
            },
            {
              name: stringToBuffer('key2'),
              type: 'hash',
              ttl: -1,
              size: 150,
              length: 100,
            },
            {
              name: stringToBuffer('key3'),
              type: 'hash',
              ttl: -1,
              size: 110,
              length: 100,
            },
          ]
          const responsePayload = { data, status: 200 }

          const apiServiceMock = jest.fn().mockResolvedValue(responsePayload)
          const onSuccessMock = jest.fn()
          apiService.post = apiServiceMock
          const controller = new AbortController()

          // Act
          await testStore.dispatch<any>(
            fetchKeysMetadata(
              data.map(({ name }) => ({ name })),
              null,
              controller.signal,
              onSuccessMock,
            ),
          )

          const expectedData = {
            keys: data.map(({ name }) => ({ name })),
            type: undefined,
          }

          expectedData.includeTTL = shownColumns.includes(BrowserColumns.TTL)
          expectedData.includeSize = shownColumns.includes(BrowserColumns.Size)

          expect(apiServiceMock).toBeCalledWith(
            '/databases//keys/get-metadata',
            expectedData,
            { params: { encoding: 'buffer' }, signal: controller.signal },
          )

          expect(onSuccessMock).toBeCalledWith(data)
        })
      })
    })

    describe('fetchKeysMetadataTree', () => {
      shownColumnsTestCases.forEach(({ name, shownColumns }) => {
        it(`success to fetch keys metadata with ${name}`, async () => {
          const initialStateWithColumns = {
            ...initialStateDefault,
            app: {
              context: {
                dbConfig: {
                  shownColumns,
                },
              },
            },
          }

          const testStore = configureStore({
            reducer: rootReducer,
            preloadedState: initialStateWithColumns,
          })

          const data = [
            {
              name: stringToBuffer('key1'),
              type: 'hash',
              ttl: -1,
              size: 100,
              path: 0,
              length: 100,
            },
            {
              name: stringToBuffer('key2'),
              type: 'hash',
              ttl: -1,
              size: 150,
              path: 1,
              length: 100,
            },
            {
              name: stringToBuffer('key3'),
              type: 'hash',
              ttl: -1,
              size: 110,
              path: 2,
              length: 100,
            },
          ]

          const responsePayload = { data, status: 200 }
          const apiServiceMock = jest.fn().mockResolvedValue(responsePayload)
          const onSuccessMock = jest.fn()
          apiService.post = apiServiceMock
          const controller = new AbortController()

          // Act
          await testStore.dispatch<any>(
            fetchKeysMetadataTree(
              data.map(({ name }, i) => [i, name]),
              null,
              controller.signal,
              onSuccessMock,
            ),
          )

          const expectedData = {
            keys: data.map(({ name }) => name),
            type: undefined,
          }

          expectedData.includeTTL = shownColumns.includes(BrowserColumns.TTL)
          expectedData.includeSize = shownColumns.includes(BrowserColumns.Size)

          // Assert
          expect(apiServiceMock).toBeCalledWith(
            '/databases//keys/get-metadata',
            expectedData,
            { params: { encoding: 'buffer' }, signal: controller.signal },
          )

          expect(onSuccessMock).toBeCalledWith(data)
        })
      })
    })

    describe('addKeyIntoList', () => {
      it('updateKeyList should be called', async () => {
        // Act
        await store.dispatch<any>(
          addKeyIntoList({ key: 'key', keyType: 'hash' }),
        )

        // Assert
        const expectedActions = [
          resetBrowserTree(),
          updateKeyList({ keyName: 'key', keyType: 'hash' }),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchPatternHistoryAction', () => {
      it('success fetch history', async () => {
        // Arrange
        const data: SearchHistoryItem[] = [
          {
            id: '1',
            mode: SearchMode.Pattern,
            filter: { type: 'list', match: '*' },
          },
          {
            id: '2',
            mode: SearchMode.Pattern,
            filter: { type: 'list', match: '*' },
          },
        ]
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchPatternHistoryAction())

        // Assert
        const expectedActions = [
          loadSearchHistory(),
          loadSearchHistorySuccess(data),
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
        await store.dispatch<any>(fetchPatternHistoryAction())

        // Assert
        const expectedActions = [
          loadSearchHistory(),
          loadSearchHistoryFailure(),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchSearchHistoryAction', () => {
      it('success fetch history', async () => {
        // Arrange
        const data: SearchHistoryItem[] = [
          {
            id: '1',
            mode: SearchMode.Pattern,
            filter: { type: 'list', match: '*' },
          },
          {
            id: '2',
            mode: SearchMode.Pattern,
            filter: { type: 'list', match: '*' },
          },
        ]
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchSearchHistoryAction(SearchMode.Pattern))

        // Assert
        const expectedActions = [
          loadSearchHistory(),
          loadSearchHistorySuccess(data),
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
        await store.dispatch<any>(fetchSearchHistoryAction(SearchMode.Pattern))

        // Assert
        const expectedActions = [
          loadSearchHistory(),
          loadSearchHistoryFailure(),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('deletePatternHistoryAction', () => {
      it('success delete history', async () => {
        // Arrange
        const responsePayload = { status: 200 }

        apiService.delete = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(deletePatternHistoryAction(['1']))

        // Assert
        const expectedActions = [
          deleteSearchHistory(),
          deleteSearchHistorySuccess(['1']),
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
        await store.dispatch<any>(deletePatternHistoryAction(['1']))

        // Assert
        const expectedActions = [
          deleteSearchHistory(),
          deleteSearchHistoryFailure(),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('deleteSearchHistoryAction', () => {
      it('success delete history', async () => {
        // Arrange
        const responsePayload = { status: 200 }

        apiService.delete = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          deleteSearchHistoryAction(SearchMode.Pattern, ['1']),
        )

        // Assert
        const expectedActions = [
          deleteSearchHistory(),
          deleteSearchHistorySuccess(['1']),
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
        await store.dispatch<any>(
          deleteSearchHistoryAction(SearchMode.Pattern, ['1']),
        )

        // Assert
        const expectedActions = [
          deleteSearchHistory(),
          deleteSearchHistoryFailure(),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
