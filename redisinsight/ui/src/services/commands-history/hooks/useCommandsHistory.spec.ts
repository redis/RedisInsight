import { faker } from '@faker-js/faker'
import { cloneDeep } from 'lodash'
import * as reactRedux from 'react-redux'

import { mockedStore, renderHook, act } from 'uiSrc/utils/test-utils'
import {
  CommandExecutionType,
  ResultsMode,
  RunQueryMode,
} from 'uiSrc/slices/interfaces'
import { FeatureFlags } from 'uiSrc/constants/featureFlags'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { commandExecutionUIFactory } from 'uiSrc/mocks/factories/workbench/commandExectution.factory'
import { CommandsHistorySQLite } from '../database/CommandsHistorySQLite'
import { CommandsHistoryIndexedDB } from '../database/CommandsHistoryIndexedDB'
import { useCommandsHistory } from './useCommandsHistory'

// Mock the database classes
jest.mock('../database/CommandsHistorySQLite')
jest.mock('../database/CommandsHistoryIndexedDB')

// Mock the notification action
jest.mock('uiSrc/slices/app/notifications', () => ({
  addErrorNotification: jest.fn((error) => ({
    type: 'app/notifications/addErrorNotification',
    payload: error,
  })),
}))

const mockedCommandsHistorySQLite = jest.mocked(CommandsHistorySQLite)
const mockedCommandsHistoryIndexedDB = jest.mocked(CommandsHistoryIndexedDB)

describe('useCommandsHistory', () => {
  let store: typeof mockedStore
  let mockUseSelector: jest.SpyInstance
  let mockUseDispatch: jest.SpyInstance
  let mockDispatch: jest.Mock

  const mockInstanceId = faker.string.uuid()
  const mockCommandExecutionType = CommandExecutionType.Workbench

  const mockCommandHistoryData = commandExecutionUIFactory.buildList(3)

  beforeEach(() => {
    jest.clearAllMocks()

    store = cloneDeep(mockedStore)
    store.clearActions()

    mockDispatch = jest.fn()
    mockUseDispatch = jest.spyOn(reactRedux, 'useDispatch')
    mockUseDispatch.mockReturnValue(mockDispatch)

    mockUseSelector = jest.spyOn(reactRedux, 'useSelector')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('when envDependent feature flag is enabled', () => {
    beforeEach(() => {
      mockUseSelector.mockReturnValue({
        [FeatureFlags.envDependent]: { flag: true },
      })
    })

    it('should initialize CommandsHistorySQLite database', () => {
      renderHook(() =>
        useCommandsHistory({
          commandExecutionType: mockCommandExecutionType,
        }),
      )

      expect(mockedCommandsHistorySQLite).toHaveBeenCalledTimes(1)
      expect(mockedCommandsHistoryIndexedDB).not.toHaveBeenCalled()
    })

    describe('getCommandsHistory', () => {
      it('should call getCommandsHistory with SQLite database and return data on success', async () => {
        const mockGetCommandsHistory = jest.fn().mockResolvedValue({
          success: true,
          data: mockCommandHistoryData,
        })
        mockedCommandsHistorySQLite.mockImplementation(() => ({
          getCommandsHistory: mockGetCommandsHistory,
          addCommandsToHistory: jest.fn(),
        }))

        const { result } = renderHook(() =>
          useCommandsHistory({
            commandExecutionType: mockCommandExecutionType,
          }),
        )

        let returnedData
        await act(async () => {
          returnedData = await (result.current as any).getCommandsHistory(
            mockInstanceId,
          )
        })

        expect(returnedData).toEqual(mockCommandHistoryData)
      })

      it('should call getCommandsHistory with SQLite database and dispatch error notification on failure', async () => {
        const mockError = {
          message: 'Database connection failed',
          name: 'Error',
          isAxiosError: false,
          toJSON: () => ({}),
        } as any
        const mockGetCommandsHistory = jest.fn().mockResolvedValue({
          success: false,
          error: mockError,
        })
        mockedCommandsHistorySQLite.mockImplementation(() => ({
          getCommandsHistory: mockGetCommandsHistory,
          addCommandsToHistory: jest.fn(),
        }))

        const { result } = renderHook(() =>
          useCommandsHistory({
            commandExecutionType: mockCommandExecutionType,
          }),
        )

        let returnedData
        await act(async () => {
          returnedData = await (result.current as any).getCommandsHistory(
            mockInstanceId,
          )
        })

        expect(returnedData).toEqual([])
        expect(mockDispatch).toHaveBeenCalledWith(
          addErrorNotification(mockError),
        )
      })
    })

    describe('addCommandsToHistory', () => {
      it('should call addCommandsToHistory with SQLite database and return data on success', async () => {
        const mockCommands = commandExecutionUIFactory.buildList(2)
        const mockAddCommandsToHistory = jest.fn().mockResolvedValue({
          success: true,
          data: mockCommands,
        })
        mockedCommandsHistorySQLite.mockImplementation(() => ({
          getCommandsHistory: jest.fn(),
          addCommandsToHistory: mockAddCommandsToHistory,
        }))

        const { result } = renderHook(() =>
          useCommandsHistory({
            commandExecutionType: mockCommandExecutionType,
          }),
        )

        let returnedData
        await act(async () => {
          returnedData = await (result.current as any).addCommandsToHistory(
            mockInstanceId,
            mockCommandExecutionType,
            mockCommands,
            {
              activeRunQueryMode: RunQueryMode.ASCII,
              resultsMode: ResultsMode.Default,
            },
          )
        })

        expect(returnedData).toEqual(mockCommands)
      })

      it('should call addCommandsToHistory with SQLite database and dispatch error notification on failure', async () => {
        const mockCommands = commandExecutionUIFactory.buildList(2)
        const mockError = {
          message: 'Failed to add commands to history',
          name: 'Error',
          isAxiosError: false,
          toJSON: () => ({}),
        } as any
        const mockAddCommandsToHistory = jest.fn().mockResolvedValue({
          success: false,
          error: mockError,
        })
        mockedCommandsHistorySQLite.mockImplementation(() => ({
          getCommandsHistory: jest.fn(),
          addCommandsToHistory: mockAddCommandsToHistory,
        }))

        const { result } = renderHook(() =>
          useCommandsHistory({
            commandExecutionType: mockCommandExecutionType,
          }),
        )

        let returnedData
        await act(async () => {
          returnedData = await (result.current as any).addCommandsToHistory(
            mockInstanceId,
            mockCommandExecutionType,
            mockCommands,
            {
              activeRunQueryMode: RunQueryMode.ASCII,
              resultsMode: ResultsMode.Default,
            },
          )
        })

        expect(returnedData).toEqual([])
        expect(mockDispatch).toHaveBeenCalledWith(
          addErrorNotification(mockError),
        )
      })

      it('should handle empty commands array', async () => {
        const mockAddCommandsToHistory = jest.fn().mockResolvedValue({
          success: true,
          data: [],
        })
        mockedCommandsHistorySQLite.mockImplementation(() => ({
          getCommandsHistory: jest.fn(),
          addCommandsToHistory: mockAddCommandsToHistory,
        }))

        const { result } = renderHook(() =>
          useCommandsHistory({
            commandExecutionType: mockCommandExecutionType,
          }),
        )

        let returnedData
        await act(async () => {
          returnedData = await (result.current as any).addCommandsToHistory(
            mockInstanceId,
            mockCommandExecutionType,
            [],
            {
              activeRunQueryMode: RunQueryMode.ASCII,
              resultsMode: ResultsMode.Default,
            },
          )
        })

        expect(returnedData).toEqual([])
      })
    })
  })

  describe('when envDependent feature flag is disabled', () => {
    beforeEach(() => {
      mockUseSelector.mockReturnValue({
        [FeatureFlags.envDependent]: { flag: false },
      })
    })

    it('should initialize CommandsHistoryIndexedDB database', () => {
      renderHook(() =>
        useCommandsHistory({
          commandExecutionType: mockCommandExecutionType,
        }),
      )

      expect(mockedCommandsHistoryIndexedDB).toHaveBeenCalledTimes(1)
      expect(mockedCommandsHistorySQLite).not.toHaveBeenCalled()
    })

    describe('getCommandsHistory', () => {
      it('should call getCommandsHistory with IndexDB database and return data on success', async () => {
        const mockGetCommandsHistory = jest.fn().mockResolvedValue({
          success: true,
          data: mockCommandHistoryData,
        })
        mockedCommandsHistoryIndexedDB.mockImplementation(() => ({
          getCommandsHistory: mockGetCommandsHistory,
          addCommandsToHistory: jest.fn(),
        }))

        const { result } = renderHook(() =>
          useCommandsHistory({
            commandExecutionType: mockCommandExecutionType,
          }),
        )

        let returnedData
        await act(async () => {
          returnedData = await (result.current as any).getCommandsHistory(
            mockInstanceId,
          )
        })

        expect(returnedData).toEqual(mockCommandHistoryData)
      })

      it('should call getCommandsHistory with IndexDB database and dispatch error notification on failure', async () => {
        const mockError = {
          message: 'IndexedDB operation failed',
          name: 'Error',
          isAxiosError: false,
          toJSON: () => ({}),
        } as any
        const mockGetCommandsHistory = jest.fn().mockResolvedValue({
          success: false,
          error: mockError,
        })
        mockedCommandsHistoryIndexedDB.mockImplementation(() => ({
          getCommandsHistory: mockGetCommandsHistory,
          addCommandsToHistory: jest.fn(),
        }))

        const { result } = renderHook(() =>
          useCommandsHistory({
            commandExecutionType: mockCommandExecutionType,
          }),
        )

        let returnedData
        await act(async () => {
          returnedData = await (result.current as any).getCommandsHistory(
            mockInstanceId,
          )
        })

        expect(returnedData).toEqual([])
        expect(mockDispatch).toHaveBeenCalledWith(
          addErrorNotification(mockError),
        )
      })
    })

    describe('addCommandsToHistory', () => {
      it('should call addCommandsToHistory with IndexedDB database and return data on success', async () => {
        const mockCommands = commandExecutionUIFactory.buildList(2)
        const mockAddCommandsToHistory = jest.fn().mockResolvedValue({
          success: true,
          data: mockCommands,
        })
        mockedCommandsHistoryIndexedDB.mockImplementation(() => ({
          getCommandsHistory: jest.fn(),
          addCommandsToHistory: mockAddCommandsToHistory,
        }))

        const { result } = renderHook(() =>
          useCommandsHistory({
            commandExecutionType: mockCommandExecutionType,
          }),
        )

        let returnedData
        await act(async () => {
          returnedData = await (result.current as any).addCommandsToHistory(
            mockInstanceId,
            mockCommandExecutionType,
            mockCommands,
            {
              activeRunQueryMode: RunQueryMode.ASCII,
              resultsMode: ResultsMode.Default,
            },
          )
        })

        expect(returnedData).toEqual(mockCommands)
      })

      it('should call addCommandsToHistory with IndexedDB database and dispatch error notification on failure', async () => {
        const mockCommands = commandExecutionUIFactory.buildList(2)
        const mockError = {
          message: 'IndexedDB add operation failed',
          name: 'Error',
          isAxiosError: false,
          toJSON: () => ({}),
        } as any
        const mockAddCommandsToHistory = jest.fn().mockResolvedValue({
          success: false,
          error: mockError,
        })
        mockedCommandsHistoryIndexedDB.mockImplementation(() => ({
          getCommandsHistory: jest.fn(),
          addCommandsToHistory: mockAddCommandsToHistory,
        }))

        const { result } = renderHook(() =>
          useCommandsHistory({
            commandExecutionType: mockCommandExecutionType,
          }),
        )

        let returnedData
        await act(async () => {
          returnedData = await (result.current as any).addCommandsToHistory(
            mockInstanceId,
            mockCommandExecutionType,
            mockCommands,
            {
              activeRunQueryMode: RunQueryMode.ASCII,
              resultsMode: ResultsMode.Default,
            },
          )
        })

        expect(returnedData).toEqual([])
      })
    })
  })
})
