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
jest.mock('./database/CommandsHistoryIndexedDB')

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
    mockedCommandsHistoryIndexedDB.mockImplementation(() => ({
      getCommandsHistory: jest.fn().mockResolvedValue({
        success: true,
        data: [],
      }),
      addCommandsToHistory: jest.fn().mockResolvedValue({
        success: true,
        data: [],
      }),
    }))

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

      mockedCommandsHistoryIndexedDB.mockImplementation(() => ({
        getCommandsHistory: mockGetCommandsHistory,
        addCommandsToHistory: jest.fn(),
      }))

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

      mockedCommandsHistorySQLite.mockImplementation(() => ({
        getCommandsHistory: mockGetCommandsHistory,
        addCommandsToHistory: jest.fn(),
      }))

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

      mockedCommandsHistoryIndexedDB.mockImplementation(() => ({
        getCommandsHistory: mockGetCommandsHistory,
        addCommandsToHistory: jest.fn(),
      }))

      // Create a new service instance with the mocked database
      const errorService = new CommandsHistoryService(mockCommandExecutionType)
      const result = await errorService.getCommandsHistory(mockInstanceId)

      expect(result).toEqual([])
      expect(mockedStore.dispatch).toHaveBeenCalledWith(
        addErrorNotification(mockError),
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

      mockedCommandsHistoryIndexedDB.mockImplementation(() => ({
        getCommandsHistory: jest.fn(),
        addCommandsToHistory: mockAddCommandsToHistory,
      }))

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

      mockedCommandsHistoryIndexedDB.mockImplementation(() => ({
        getCommandsHistory: jest.fn(),
        addCommandsToHistory: mockAddCommandsToHistory,
      }))

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

      mockedCommandsHistoryIndexedDB.mockImplementation(() => ({
        getCommandsHistory: jest.fn(),
        addCommandsToHistory: mockAddCommandsToHistory,
      }))

      const result = await commandsHistoryService.addCommandsToHistory(
        mockInstanceId,
        mockCommands,
        mockOptions,
      )

      expect(result).toEqual([])
    })
  })
})
