import { merge } from 'lodash'
import { faker } from '@faker-js/faker'

import { RootState, store } from 'uiSrc/slices/store'
import {
  CommandExecutionType,
  ResultsMode,
  RunQueryMode,
} from 'uiSrc/slices/interfaces'
import { FeatureFlags } from 'uiSrc/constants/featureFlags'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { commandExecutionUIFactory } from 'uiSrc/mocks/factories/workbench/commandExectution.factory'

import { CommandsHistoryService } from './commandsHistoryService'
import { CommandsHistorySQLite } from './database/CommandsHistorySQLite'
import { CommandsHistoryIndexedDB } from './database/CommandsHistoryIndexedDB'
import { initialState as appFeaturesInitialState } from 'uiSrc/slices/app/features'

// Mock the database classes
jest.mock('./database/CommandsHistorySQLite')
jest.mock('./database/CommandsHistoryIndexedDB', () => ({
  CommandsHistoryIndexedDB: jest.fn().mockImplementation(() => ({
    getCommandsHistory: jest
      .fn()
      .mockResolvedValue({ success: true, data: [] }),
    getCommandHistory: jest
      .fn()
      .mockResolvedValue({ success: true, data: null }),
    addCommandsToHistory: jest
      .fn()
      .mockResolvedValue({ success: true, data: [] }),
    deleteCommandFromHistory: jest.fn().mockResolvedValue({ success: true }),
    clearCommandsHistory: jest.fn().mockResolvedValue({ success: true }),
  })),
}))

// Mock the notification action
jest.mock('uiSrc/slices/app/notifications', () => ({
  addErrorNotification: jest.fn((error) => ({
    type: 'app/notifications/addErrorNotification',
    payload: error,
  })),
}))

// Mock the store module
jest.mock('uiSrc/slices/store', () => ({
  store: {
    getState: jest.fn(),
    dispatch: jest.fn(),
  },
}))

const mockedCommandsHistorySQLite = jest.mocked(CommandsHistorySQLite)
const mockedCommandsHistoryIndexedDB = jest.mocked(CommandsHistoryIndexedDB)

describe('CommandsHistoryService', () => {
  let commandsHistoryService: CommandsHistoryService
  const mockedStore = jest.mocked(store)

  const mockInstanceId = faker.string.uuid()
  const mockCommandExecutionType = faker.helpers.enumValue(CommandExecutionType)

  const mockCommandHistoryData = commandExecutionUIFactory.buildList(3)

  // Helper function to create default database mock
  const createDefaultDatabaseMock = (overrides = {}) => ({
    getCommandsHistory: jest.fn().mockResolvedValue({
      success: true,
      data: [],
    }),
    getCommandHistory: jest.fn().mockResolvedValue({
      success: true,
      data: null,
    }),
    addCommandsToHistory: jest.fn().mockResolvedValue({
      success: true,
      data: [],
    }),
    deleteCommandFromHistory: jest.fn().mockResolvedValue({
      success: true,
    }),
    clearCommandsHistory: jest.fn().mockResolvedValue({
      success: true,
    }),
    ...overrides,
  })

  beforeEach(() => {
    jest.clearAllMocks()

    // Reset mock store using the initial state
    mockedStore.getState.mockReturnValue({
      app: {
        features: merge({}, appFeaturesInitialState, {
          featureFlags: {
            features: {
              [FeatureFlags.envDependent]: { flag: false },
            },
          },
        }),
      },
    } as RootState)
    mockedStore.dispatch.mockClear()

    // Set up default database mock
    mockedCommandsHistoryIndexedDB.mockImplementation(
      () => createDefaultDatabaseMock() as any,
    )

    // Create a new instance for each test
    commandsHistoryService = new CommandsHistoryService(
      mockCommandExecutionType,
    )
  })

  describe('getCommandsHistory', () => {
    it('should initialize with IndexedDB when envDependent feature is disabled', async () => {
      const mockGetCommandsHistory = jest.fn().mockResolvedValue({
        success: true,
        data: mockCommandHistoryData,
      })

      mockedCommandsHistoryIndexedDB.mockImplementation(
        () =>
          createDefaultDatabaseMock({
            getCommandsHistory: mockGetCommandsHistory,
          }) as any,
      )

      // Create a new service instance with the mocked database
      const indexedDBService = new CommandsHistoryService(
        mockCommandExecutionType,
      )
      const result = await indexedDBService.getCommandsHistory(mockInstanceId)

      expect(result).toEqual(mockCommandHistoryData)
      expect(mockedCommandsHistoryIndexedDB).toHaveBeenCalled()
    })

    it('should initialize with SQLite when envDependent feature is enabled', async () => {
      // Update store state for this test using initial state
      mockedStore.getState.mockReturnValue({
        app: {
          features: merge({}, appFeaturesInitialState, {
            featureFlags: {
              features: {
                [FeatureFlags.envDependent]: { flag: true },
              },
            },
          }),
        },
      } as any)

      const mockGetCommandsHistory = jest.fn().mockResolvedValue({
        success: true,
        data: mockCommandHistoryData,
      })

      mockedCommandsHistorySQLite.mockImplementation(
        () =>
          createDefaultDatabaseMock({
            getCommandsHistory: mockGetCommandsHistory,
          }) as any,
      )

      // Create a new service instance with the updated store state
      const sqliteService = new CommandsHistoryService(mockCommandExecutionType)
      const result = await sqliteService.getCommandsHistory(mockInstanceId)

      expect(result).toEqual(mockCommandHistoryData)
      expect(mockedCommandsHistorySQLite).toHaveBeenCalled()
    })

    it('should dispatch error notification when database returns error', async () => {
      const mockError = { message: 'Database error' } as any
      const mockGetCommandsHistory = jest.fn().mockResolvedValue({
        success: false,
        error: mockError,
      })

      mockedCommandsHistoryIndexedDB.mockImplementation(
        () =>
          createDefaultDatabaseMock({
            getCommandsHistory: mockGetCommandsHistory,
          }) as any,
      )

      // Create a new service instance with the mocked database
      const errorService = new CommandsHistoryService(mockCommandExecutionType)
      const result = await errorService.getCommandsHistory(mockInstanceId)

      expect(result).toEqual([])
      expect(mockedStore.dispatch).toHaveBeenCalledWith(
        addErrorNotification(mockError),
      )
    })
  })

  describe('getCommandHistory', () => {
    const mockCommandId = faker.string.uuid()
    const mockCommandData = commandExecutionUIFactory.build()

    it('should initialize with IndexedDB when envDependent feature is disabled', async () => {
      const mockGetCommandHistory = jest.fn().mockResolvedValue({
        success: true,
        data: mockCommandData,
      })

      mockedCommandsHistoryIndexedDB.mockImplementation(
        () =>
          createDefaultDatabaseMock({
            getCommandHistory: mockGetCommandHistory,
          }) as any,
      )

      // Create a new service instance with the mocked database
      const indexedDBService = new CommandsHistoryService(
        mockCommandExecutionType,
      )
      const result = await indexedDBService.getCommandHistory(
        mockInstanceId,
        mockCommandId,
      )

      expect(result).toEqual(mockCommandData)
      expect(mockedCommandsHistoryIndexedDB).toHaveBeenCalled()
    })

    it('should initialize with SQLite when envDependent feature is enabled', async () => {
      // Update store state for this test using initial state
      mockedStore.getState.mockReturnValue({
        app: {
          features: merge({}, appFeaturesInitialState, {
            featureFlags: {
              features: {
                [FeatureFlags.envDependent]: { flag: true },
              },
            },
          }),
        },
      } as any)

      const mockGetCommandHistory = jest.fn().mockResolvedValue({
        success: true,
        data: mockCommandData,
      })

      mockedCommandsHistorySQLite.mockImplementation(
        () =>
          createDefaultDatabaseMock({
            getCommandHistory: mockGetCommandHistory,
          }) as any,
      )

      // Create a new service instance with the updated store state
      const sqliteService = new CommandsHistoryService(mockCommandExecutionType)
      const result = await sqliteService.getCommandHistory(
        mockInstanceId,
        mockCommandId,
      )

      expect(result).toEqual(mockCommandData)
      expect(mockedCommandsHistorySQLite).toHaveBeenCalled()
    })

    it('should dispatch error notification when database returns error', async () => {
      const mockError = { message: 'Database error' } as any
      const mockGetCommandHistory = jest.fn().mockResolvedValue({
        success: false,
        error: mockError,
      })

      mockedCommandsHistoryIndexedDB.mockImplementation(
        () =>
          createDefaultDatabaseMock({
            getCommandHistory: mockGetCommandHistory,
          }) as any,
      )

      // Create a new service instance with the mocked database
      const errorService = new CommandsHistoryService(mockCommandExecutionType)
      const result = await errorService.getCommandHistory(
        mockInstanceId,
        mockCommandId,
      )

      expect(result).toEqual(null)
      expect(mockedStore.dispatch).toHaveBeenCalledWith(
        addErrorNotification(mockError),
      )
    })

    it('should return null when data is not available', async () => {
      const mockGetCommandHistory = jest.fn().mockResolvedValue({
        success: true,
        data: null,
      })

      mockedCommandsHistoryIndexedDB.mockImplementation(
        () =>
          createDefaultDatabaseMock({
            getCommandHistory: mockGetCommandHistory,
          }) as any,
      )

      // Create a new service instance with the mocked database
      const nullDataService = new CommandsHistoryService(
        mockCommandExecutionType,
      )
      const result = await nullDataService.getCommandHistory(
        mockInstanceId,
        mockCommandId,
      )

      expect(result).toEqual(null)
    })

    it('should handle different instance IDs and command IDs', async () => {
      const instanceId1 = faker.string.uuid()
      const instanceId2 = faker.string.uuid()
      const commandId1 = faker.string.uuid()
      const commandId2 = faker.string.uuid()

      const mockCommand1 = commandExecutionUIFactory.build()
      const mockCommand2 = commandExecutionUIFactory.build()

      const mockGetCommandHistory = jest
        .fn()
        .mockResolvedValueOnce({ success: true, data: mockCommand1 })
        .mockResolvedValueOnce({ success: true, data: mockCommand2 })

      mockedCommandsHistoryIndexedDB.mockImplementation(
        () =>
          createDefaultDatabaseMock({
            getCommandHistory: mockGetCommandHistory,
          }) as any,
      )

      // Create a new service instance with the mocked database
      const multiCommandService = new CommandsHistoryService(
        mockCommandExecutionType,
      )

      const result1 = await multiCommandService.getCommandHistory(
        instanceId1,
        commandId1,
      )
      const result2 = await multiCommandService.getCommandHistory(
        instanceId2,
        commandId2,
      )

      expect(result1).toEqual(mockCommand1)
      expect(result2).toEqual(mockCommand2)
      expect(mockGetCommandHistory).toHaveBeenCalledTimes(2)
      expect(mockGetCommandHistory).toHaveBeenNthCalledWith(
        1,
        instanceId1,
        commandId1,
      )
      expect(mockGetCommandHistory).toHaveBeenNthCalledWith(
        2,
        instanceId2,
        commandId2,
      )
    })
  })

  describe('addCommandsToHistory', () => {
    const mockCommands = [faker.string.alphanumeric(10)]
    const mockOptions = {
      activeRunQueryMode: RunQueryMode.ASCII,
      resultsMode: ResultsMode.Default,
    }

    it('should add commands to history successfully', async () => {
      const mockAddCommandsToHistory = jest.fn().mockResolvedValue({
        success: true,
        data: mockCommandHistoryData,
      })

      mockedCommandsHistoryIndexedDB.mockImplementation(
        () =>
          createDefaultDatabaseMock({
            addCommandsToHistory: mockAddCommandsToHistory,
          }) as any,
      )

      // Create a new service instance with the mocked database
      const addCommandsService = new CommandsHistoryService(
        mockCommandExecutionType,
      )
      const result = await addCommandsService.addCommandsToHistory(
        mockInstanceId,
        mockCommands,
        mockOptions,
      )

      expect(result).toEqual(mockCommandHistoryData)
    })

    it('should dispatch error notification when database returns error', async () => {
      const mockError = { message: 'Database error' } as any
      const mockAddCommandsToHistory = jest.fn().mockResolvedValue({
        success: false,
        error: mockError,
      })

      mockedCommandsHistoryIndexedDB.mockImplementation(
        () =>
          createDefaultDatabaseMock({
            addCommandsToHistory: mockAddCommandsToHistory,
          }) as any,
      )

      // Create a new service instance with the mocked database
      const errorService = new CommandsHistoryService(mockCommandExecutionType)
      const result = await errorService.addCommandsToHistory(
        mockInstanceId,
        mockCommands,
        mockOptions,
      )

      expect(result).toEqual([])
      expect(mockedStore.dispatch).toHaveBeenCalledWith(
        addErrorNotification(mockError),
      )
    })

    it('should return empty array when success is false', async () => {
      const mockAddCommandsToHistory = jest.fn().mockResolvedValue({
        success: false,
        data: mockCommandHistoryData,
      })

      mockedCommandsHistoryIndexedDB.mockImplementation(
        () =>
          createDefaultDatabaseMock({
            addCommandsToHistory: mockAddCommandsToHistory,
          }) as any,
      )

      const result = await commandsHistoryService.addCommandsToHistory(
        mockInstanceId,
        mockCommands,
        mockOptions,
      )

      expect(result).toEqual([])
    })
  })

  describe('deleteCommandFromHistory', () => {
    const mockCommandId = faker.string.uuid()

    it('should delete command from history successfully', async () => {
      const mockDeleteCommandFromHistory = jest.fn().mockResolvedValue({
        success: true,
      })

      mockedCommandsHistoryIndexedDB.mockImplementation(
        () =>
          createDefaultDatabaseMock({
            deleteCommandFromHistory: mockDeleteCommandFromHistory,
          }) as any,
      )

      // Create a new service instance with the mocked database
      const deleteCommandService = new CommandsHistoryService(
        mockCommandExecutionType,
      )
      await deleteCommandService.deleteCommandFromHistory(
        mockInstanceId,
        mockCommandId,
      )

      expect(mockDeleteCommandFromHistory).toHaveBeenCalledWith(
        mockInstanceId,
        mockCommandId,
      )
      expect(mockedStore.dispatch).not.toHaveBeenCalled()
    })

    it('should dispatch error notification when database returns error', async () => {
      const mockError = { message: 'Database error' } as any
      const mockDeleteCommandFromHistory = jest.fn().mockResolvedValue({
        success: false,
        error: mockError,
      })

      mockedCommandsHistoryIndexedDB.mockImplementation(
        () =>
          createDefaultDatabaseMock({
            deleteCommandFromHistory: mockDeleteCommandFromHistory,
          }) as any,
      )

      // Create a new service instance with the mocked database
      const errorService = new CommandsHistoryService(mockCommandExecutionType)
      await errorService.deleteCommandFromHistory(mockInstanceId, mockCommandId)

      expect(mockedStore.dispatch).toHaveBeenCalledWith(
        addErrorNotification(mockError),
      )
    })

    it('should work with SQLite database when envDependent feature is enabled', async () => {
      // Update store state for this test using initial state
      mockedStore.getState.mockReturnValue({
        app: {
          features: merge({}, appFeaturesInitialState, {
            featureFlags: {
              features: {
                [FeatureFlags.envDependent]: { flag: true },
              },
            },
          }),
        },
      } as RootState)

      const mockDeleteCommandFromHistory = jest.fn().mockResolvedValue({
        success: true,
      })

      mockedCommandsHistorySQLite.mockImplementation(
        () =>
          createDefaultDatabaseMock({
            deleteCommandFromHistory: mockDeleteCommandFromHistory,
          }) as any,
      )

      // Create a new service instance with the updated store state
      const sqliteService = new CommandsHistoryService(mockCommandExecutionType)
      await sqliteService.deleteCommandFromHistory(
        mockInstanceId,
        mockCommandId,
      )

      expect(mockDeleteCommandFromHistory).toHaveBeenCalledWith(
        mockInstanceId,
        mockCommandId,
      )
      expect(mockedCommandsHistorySQLite).toHaveBeenCalled()
    })

    it('should handle different command IDs', async () => {
      const commandId1 = faker.string.uuid()
      const commandId2 = faker.string.uuid()

      const mockDeleteCommandFromHistory = jest.fn().mockResolvedValue({
        success: true,
      })

      mockedCommandsHistoryIndexedDB.mockImplementation(
        () =>
          createDefaultDatabaseMock({
            deleteCommandFromHistory: mockDeleteCommandFromHistory,
          }) as any,
      )

      // Create a new service instance with the mocked database
      const deleteCommandService = new CommandsHistoryService(
        mockCommandExecutionType,
      )

      await deleteCommandService.deleteCommandFromHistory(
        mockInstanceId,
        commandId1,
      )
      await deleteCommandService.deleteCommandFromHistory(
        mockInstanceId,
        commandId2,
      )

      expect(mockDeleteCommandFromHistory).toHaveBeenCalledTimes(2)
      expect(mockDeleteCommandFromHistory).toHaveBeenNthCalledWith(
        1,
        mockInstanceId,
        commandId1,
      )
      expect(mockDeleteCommandFromHistory).toHaveBeenNthCalledWith(
        2,
        mockInstanceId,
        commandId2,
      )
    })
  })

  describe('clearCommandsHistory', () => {
    it('should clear command history successfully', async () => {
      const mockClearCommandsHistory = jest.fn().mockResolvedValue({
        success: true,
      })

      mockedCommandsHistoryIndexedDB.mockImplementation(
        () =>
          createDefaultDatabaseMock({
            clearCommandsHistory: mockClearCommandsHistory,
          }) as any,
      )

      // Create a new service instance with the mocked database
      const clearCommandsService = new CommandsHistoryService(
        mockCommandExecutionType,
      )
      await clearCommandsService.clearCommandsHistory(mockInstanceId)

      expect(mockClearCommandsHistory).toHaveBeenCalledWith(
        mockInstanceId,
        mockCommandExecutionType,
      )
      expect(mockedStore.dispatch).not.toHaveBeenCalled()
    })

    it('should dispatch error notification when database returns error', async () => {
      const mockError = { message: 'Database error' } as any
      const mockClearCommandsHistory = jest.fn().mockResolvedValue({
        success: false,
        error: mockError,
      })

      mockedCommandsHistoryIndexedDB.mockImplementation(
        () =>
          createDefaultDatabaseMock({
            clearCommandsHistory: mockClearCommandsHistory,
          }) as any,
      )

      // Create a new service instance with the mocked database
      const errorService = new CommandsHistoryService(mockCommandExecutionType)
      await errorService.clearCommandsHistory(mockInstanceId)

      expect(mockedStore.dispatch).toHaveBeenCalledWith(
        addErrorNotification(mockError),
      )
    })

    it('should work with SQLite database when envDependent feature is enabled', async () => {
      // Update store state for this test using initial state
      mockedStore.getState.mockReturnValue({
        app: {
          features: merge({}, appFeaturesInitialState, {
            featureFlags: {
              features: {
                [FeatureFlags.envDependent]: { flag: true },
              },
            },
          }),
        },
      } as RootState)

      const mockClearCommandsHistory = jest.fn().mockResolvedValue({
        success: true,
      })

      mockedCommandsHistorySQLite.mockImplementation(
        () =>
          createDefaultDatabaseMock({
            clearCommandsHistory: mockClearCommandsHistory,
          }) as any,
      )

      // Create a new service instance with the updated store state
      const sqliteService = new CommandsHistoryService(mockCommandExecutionType)
      await sqliteService.clearCommandsHistory(mockInstanceId)

      expect(mockClearCommandsHistory).toHaveBeenCalledWith(
        mockInstanceId,
        mockCommandExecutionType,
      )
      expect(mockedCommandsHistorySQLite).toHaveBeenCalled()
    })

    it('should handle different instance IDs', async () => {
      const instanceId1 = 'instance-1'
      const instanceId2 = 'instance-2'

      const mockClearCommandsHistory = jest.fn().mockResolvedValue({
        success: true,
      })

      mockedCommandsHistoryIndexedDB.mockImplementation(
        () =>
          createDefaultDatabaseMock({
            clearCommandsHistory: mockClearCommandsHistory,
          }) as any,
      )

      // Create a new service instance with the mocked database
      const clearCommandsService = new CommandsHistoryService(
        mockCommandExecutionType,
      )

      await clearCommandsService.clearCommandsHistory(instanceId1)
      await clearCommandsService.clearCommandsHistory(instanceId2)

      expect(mockClearCommandsHistory).toHaveBeenCalledTimes(2)
      expect(mockClearCommandsHistory).toHaveBeenNthCalledWith(
        1,
        instanceId1,
        mockCommandExecutionType,
      )
      expect(mockClearCommandsHistory).toHaveBeenNthCalledWith(
        2,
        instanceId2,
        mockCommandExecutionType,
      )
    })
  })
})
