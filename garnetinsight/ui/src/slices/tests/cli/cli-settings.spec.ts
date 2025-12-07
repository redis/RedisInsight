import { cloneDeep } from 'lodash'
import { apiService } from 'uiSrc/services'
import {
  cleanup,
  mockedStore,
  initialStateDefault,
  clearStoreActions,
} from 'uiSrc/utils/test-utils'
import { setCliDbIndex } from 'uiSrc/slices/cli/cli-output'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import reducer, {
  initialState,
  toggleCli,
  resetCliSettings,
  processCliClient,
  processCliClientSuccess,
  processCliClientFailure,
  cliSettingsSelector,
  createCliClientAction,
  updateCliClientAction,
  deleteCliClientAction,
  deleteCliClientSuccess,
  getUnsupportedCommandsSuccess,
  fetchUnsupportedCliCommandsAction,
  toggleCliHelper,
  setMatchedCommand,
  setCliEnteringCommand,
  setSearchedCommand,
  setSearchingCommandFilter,
  setSearchingCommand,
  clearSearchingCommand,
  resetCliClientUuid,
  resetCliHelperSettings,
  goBackFromCommand,
} from '../../cli/cli-settings'

let mathRandom: jest.SpyInstance<number>
const random = 0.91911
let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  localStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

describe('cliSettings slice', () => {
  beforeAll(() => {
    mathRandom = jest.spyOn(Math, 'random').mockImplementation(() => random)
  })

  afterAll(() => {
    mathRandom.mockRestore()
  })

  describe('toggleCliHelper', () => {
    it('default state.isShowHelper should be falsy', () => {
      // Arrange
      const state: typeof initialState = {
        ...initialState,
        isShowHelper: false,
        isMinimizedHelper: false,
      }

      expect(cliSettingsSelector(initialStateDefault)).toEqual(state)
    })

    it('should properly set !isShowHelper', () => {
      // Arrange
      const state: typeof initialState = {
        ...initialState,
        isShowHelper: true,
        isMinimizedHelper: true,
      }

      // Act
      const nextState = reducer(initialState, toggleCliHelper())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          settings: nextState,
        },
      })
      expect(cliSettingsSelector(rootState)).toEqual(state)
    })
  })

  describe('toggleCli', () => {
    it('should properly set !isShowCli', () => {
      // Arrange
      const state: typeof initialState = {
        ...initialState,
        isShowCli: true,
        isMinimizedHelper: false,
      }

      // Act
      const nextState = reducer(initialState, toggleCli())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          settings: nextState,
        },
      })
      expect(cliSettingsSelector(rootState)).toEqual(state)
    })
  })

  describe('setMatchedCommand', () => {
    it('should properly set matchedCommand', () => {
      // Arrange
      const matchedCommand = 'get'
      const state: typeof initialState = {
        ...initialState,
        matchedCommand,
      }

      // Act
      const nextState = reducer(initialState, setMatchedCommand(matchedCommand))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          settings: nextState,
        },
      })
      expect(cliSettingsSelector(rootState)).toEqual(state)
    })
  })

  describe('setCliEnteringCommand', () => {
    it('should properly set isEnteringCommand = true', () => {
      // Arrange
      const state: typeof initialState = {
        ...initialState,
        isEnteringCommand: true,
      }

      // Act
      const nextState = reducer(initialState, setCliEnteringCommand())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          settings: nextState,
        },
      })
      expect(cliSettingsSelector(rootState)).toEqual(state)
    })
  })

  describe('setSearchedCommand', () => {
    it('should properly set searched command', () => {
      // Arrange
      const searchedCommand = 'SET'
      const state: typeof initialState = {
        ...initialState,
        searchedCommand,
        isSearching: false,
      }

      // Act
      const nextState = reducer(
        initialState,
        setSearchedCommand(searchedCommand),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          settings: nextState,
        },
      })
      expect(cliSettingsSelector(rootState)).toEqual(state)
    })
  })

  describe('setSearchingCommand', () => {
    it('should properly set searching command', () => {
      // Arrange
      const searchingCommand = 'se'
      const state: typeof initialState = {
        ...initialState,
        searchingCommand,
        isEnteringCommand: false,
        isSearching: true,
      }

      // Act
      const nextState = reducer(
        initialState,
        setSearchingCommand(searchingCommand),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          settings: nextState,
        },
      })
      expect(cliSettingsSelector(rootState)).toEqual(state)
    })
  })

  describe('setSearchingCommandFilter', () => {
    it('should properly set searching command filter', () => {
      // Arrange
      const searchingCommandFilter = 'server'
      const state: typeof initialState = {
        ...initialState,
        searchingCommandFilter,
        isEnteringCommand: false,
        isSearching: true,
      }

      // Act
      const nextState = reducer(
        initialState,
        setSearchingCommandFilter(searchingCommandFilter),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          settings: nextState,
        },
      })
      expect(cliSettingsSelector(rootState)).toEqual(state)
    })
  })

  describe('clearSearchingCommand', () => {
    it('should properly clear search', () => {
      // Arrange
      const state: typeof initialState = {
        ...initialState,
        searchingCommand: '',
        searchedCommand: '',
        searchingCommandFilter: '',
        isSearching: false,
      }

      // Act
      const nextState = reducer(initialState, clearSearchingCommand())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          settings: nextState,
        },
      })
      expect(cliSettingsSelector(rootState)).toEqual(state)
    })
  })

  describe('resetCliSettings', () => {
    it('should properly set isShowCli = false', () => {
      // Arrange
      const state: typeof initialState = {
        ...initialState,
        isShowCli: false,
      }

      // Act
      const nextState = reducer(initialState, resetCliSettings())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          settings: nextState,
        },
      })
      expect(cliSettingsSelector(rootState)).toEqual(state)
    })
  })

  describe('resetCliClientUuid', () => {
    it('should properly set cliClientUuid = ""', () => {
      // Arrange
      const state: typeof initialState = {
        ...initialState,
        cliClientUuid: '',
      }

      // Act
      const nextState = reducer(
        { ...initialState, cliClientUuid: '123' },
        resetCliClientUuid(),
      )

      // Assert
      const rootState = {
        ...initialStateDefault,
        cli: {
          settings: nextState,
        },
      }
      expect(cliSettingsSelector(rootState)).toEqual(state)
    })
  })

  describe('resetCliHelperSettings', () => {
    it('should properly set Cli Helper settings to default', () => {
      // Arrange
      const initState: typeof initialState = {
        ...initialState,
        isShowHelper: true,
        isSearching: true,
        isEnteringCommand: true,
        isMinimizedHelper: true,
        matchedCommand: '123',
        searchingCommand: '123',
        searchedCommand: '123',
        searchingCommandFilter: '123',
      }

      const state: typeof initialState = {
        ...initialState,
        isShowHelper: false,
        isSearching: false,
        isEnteringCommand: false,
        isMinimizedHelper: false,
        matchedCommand: '',
        searchingCommand: '',
        searchedCommand: '',
        searchingCommandFilter: '',
      }

      // Act
      const nextState = reducer(initState, resetCliHelperSettings())

      // Assert
      const rootState = {
        ...initialStateDefault,
        cli: {
          settings: nextState,
        },
      }
      expect(cliSettingsSelector(rootState)).toEqual(state)
    })
  })

  describe('goBackFromCommand', () => {
    it('should properly set state', () => {
      // Arrange
      const initState: typeof initialState = {
        ...initialState,
        isShowHelper: true,
        isSearching: true,
        isEnteringCommand: true,
        isMinimizedHelper: true,
        matchedCommand: '123',
        searchingCommand: '123',
        searchedCommand: '123',
        searchingCommandFilter: '123',
      }

      const state: typeof initialState = {
        ...initState,
        matchedCommand: '',
        searchedCommand: '',
        isSearching: true,
      }

      // Act
      const nextState = reducer(initState, goBackFromCommand())

      // Assert
      const rootState = { ...initialStateDefault, cli: { settings: nextState } }
      expect(cliSettingsSelector(rootState)).toEqual(state)
    })
  })

  describe('processCliClient', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, processCliClient())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          settings: nextState,
        },
      })
      expect(cliSettingsSelector(rootState)).toEqual(state)
    })
  })

  describe('processCliClientSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const data = { uuid: '70b95d32-c19d-4311-bb24-e684af12cf15' }
      const state = {
        ...initialState,
        loading: false,
        cliClientUuid: data.uuid,
      }

      // Act
      const nextState = reducer(
        initialState,
        processCliClientSuccess(data?.uuid),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          settings: nextState,
        },
      })
      expect(cliSettingsSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data = { uuid: '' }

      const state = {
        ...initialState,
        loading: false,
        cliClientUuid: data.uuid,
      }

      // Act
      const nextState = reducer(
        initialState,
        processCliClientSuccess(data?.uuid),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          settings: nextState,
        },
      })
      expect(cliSettingsSelector(rootState)).toEqual(state)
    })
  })

  describe('processCliClientFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        errorClient: data,
      }

      // Act
      const nextState = reducer(initialState, processCliClientFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          settings: nextState,
        },
      })
      expect(cliSettingsSelector(rootState)).toEqual(state)
    })
  })

  describe('getUnsupportedCommandsSuccess', () => {
    it('should properly set unsupportedCommands', () => {
      // Arrange
      const data = ['sync', 'subscribe']
      const state = {
        ...initialState,
        loading: false,
        unsupportedCommands: data,
      }

      // Act
      const nextState = reducer(
        initialState,
        getUnsupportedCommandsSuccess(data),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          settings: nextState,
        },
      })
      expect(cliSettingsSelector(rootState)).toEqual(state)
    })
  })

  describe('thunks', () => {
    it('call both createCliClientAction and processCliClientSuccess when fetch is successed', async () => {
      // Arrange
      const data = { uuid: '70b95d32-c19d-4311-bb24-e684af12cf15' }
      const responsePayload = { data, status: 200 }

      apiService.post = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(
        createCliClientAction(INSTANCE_ID_MOCK, () => {}),
      )

      // Assert
      const expectedActions = [
        processCliClient(),
        processCliClientSuccess(responsePayload.data?.uuid),
        setCliDbIndex(0),
      ]
      expect(clearStoreActions(store.getActions())).toEqual(
        clearStoreActions(expectedActions),
      )
    })

    it('call both createCliClientAction and processCliClientFailure when fetch is fail', async () => {
      // Arrange
      const errorMessage =
        'Could not connect to aoeu:123, please check the connection details.'
      const responsePayload = {
        response: {
          status: 500,
          data: { message: errorMessage },
        },
      }

      apiService.post = jest.fn().mockRejectedValueOnce(responsePayload)

      // Act
      await store.dispatch<any>(
        createCliClientAction(INSTANCE_ID_MOCK, () => {}),
      )

      // Assert
      const expectedActions = [
        processCliClient(),
        processCliClientFailure(responsePayload.response.data.message),
      ]
      expect(clearStoreActions(store.getActions())).toEqual(
        clearStoreActions(expectedActions),
      )
    })

    it('call both updateCliClientAction and processCliClientSuccess when fetch is successed', async () => {
      // Arrange
      const uuid = '70b95d32-c19d-4311-bb24-e684af12cf15'
      const data = { uuid }
      const responsePayload = { data, status: 200 }

      apiService.patch = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(updateCliClientAction(uuid))

      // Assert
      const expectedActions = [
        processCliClient(),
        processCliClientSuccess(responsePayload.data?.uuid),
        setCliDbIndex(0),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })

    it('call both updateCliClientAction and processCliClientFailure when fetch is fail', async () => {
      // Arrange
      const uuid = '70b95d32-c19d-4311-bb24-e684af12cf15'
      const errorMessage =
        'Could not connect to aoeu:123, please check the connection details.'
      const responsePayload = {
        response: {
          status: 500,
          data: { message: errorMessage },
        },
      }

      apiService.patch = jest.fn().mockRejectedValueOnce(responsePayload)

      // Act
      await store.dispatch<any>(updateCliClientAction(uuid))

      // Assert
      const expectedActions = [
        processCliClient(),
        processCliClientFailure(responsePayload.response.data.message),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })

    it('call both deleteCliClientAction and deleteCliClientSuccess when fetch is successed', async () => {
      // Arrange
      const uuid = '70b95d32-c19d-4311-bb24-e684af12cf15'
      const data = { uuid }
      const responsePayload = { data, status: 200 }

      apiService.delete = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(deleteCliClientAction(uuid))

      // Assert
      const expectedActions = [processCliClient(), deleteCliClientSuccess()]
      expect(store.getActions()).toEqual(expectedActions)
    })

    it('call both deleteCliClientAction and processCliClientFailure when fetch is fail', async () => {
      // Arrange
      const uuid = '70b95d32-c19d-4311-bb24-e684af12cf15'
      const errorMessage =
        'Could not connect to aoeu:123, please check the connection details.'
      const responsePayload = {
        response: {
          status: 500,
          data: { message: errorMessage },
        },
      }

      apiService.delete = jest.fn().mockRejectedValueOnce(responsePayload)

      // Act
      await store.dispatch<any>(deleteCliClientAction(uuid))

      // Assert
      const expectedActions = [
        processCliClient(),
        processCliClientFailure(responsePayload.response.data.message),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })

    it('call both fetchUnsupportedCliCommandsAction and getUnsupportedCommandsSuccess when fetch is successed', async () => {
      // Arrange
      const data = ['sync', 'subscribe']
      const responsePayload = { data, status: 200 }

      apiService.get = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(fetchUnsupportedCliCommandsAction())

      // Assert
      const expectedActions = [
        processCliClient(),
        getUnsupportedCommandsSuccess(data),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })
  })
})
