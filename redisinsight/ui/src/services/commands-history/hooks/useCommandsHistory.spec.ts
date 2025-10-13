import { faker } from '@faker-js/faker'
import { cloneDeep } from 'lodash'
import * as reactRedux from 'react-redux'

import { mockedStore, renderHook, act } from 'uiSrc/utils/test-utils'
import { CommandExecutionType } from 'uiSrc/slices/interfaces'
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

    it('should call getCommandsHistory with SQLite database and return data on success', async () => {
      const mockGetCommandsHistory = jest.fn().mockResolvedValue({
        success: true,
        data: mockCommandHistoryData,
      })
      mockedCommandsHistorySQLite.mockImplementation(() => ({
        getCommandsHistory: mockGetCommandsHistory,
      }))

      const { result } = renderHook(() =>
        useCommandsHistory({
          commandExecutionType: mockCommandExecutionType,
        }),
      )

      let returnedData
      await act(async () => {
        returnedData = await result.current.getCommandsHistory(mockInstanceId)
      })

      expect(mockGetCommandsHistory).toHaveBeenCalledWith(
        mockInstanceId,
        mockCommandExecutionType,
      )
      expect(returnedData).toEqual(mockCommandHistoryData)
      expect(mockDispatch).not.toHaveBeenCalled()
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
      }))

      const { result } = renderHook(() =>
        useCommandsHistory({
          commandExecutionType: mockCommandExecutionType,
        }),
      )

      let returnedData
      await act(async () => {
        returnedData = await result.current.getCommandsHistory(mockInstanceId)
      })

      expect(mockGetCommandsHistory).toHaveBeenCalledWith(
        mockInstanceId,
        mockCommandExecutionType,
      )
      expect(returnedData).toEqual([])
      expect(mockDispatch).toHaveBeenCalledWith(addErrorNotification(mockError))
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

    it('should call getCommandsHistory with IndexDB database and return data on success', async () => {
      const mockGetCommandsHistory = jest.fn().mockResolvedValue({
        success: true,
        data: mockCommandHistoryData,
      })
      mockedCommandsHistoryIndexedDB.mockImplementation(() => ({
        getCommandsHistory: mockGetCommandsHistory,
      }))

      const { result } = renderHook(() =>
        useCommandsHistory({
          commandExecutionType: mockCommandExecutionType,
        }),
      )

      let returnedData
      await act(async () => {
        returnedData = await result.current.getCommandsHistory(mockInstanceId)
      })

      expect(mockGetCommandsHistory).toHaveBeenCalledWith(
        mockInstanceId,
        mockCommandExecutionType,
      )
      expect(returnedData).toEqual(mockCommandHistoryData)
      expect(mockDispatch).not.toHaveBeenCalled()
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
      }))

      const { result } = renderHook(() =>
        useCommandsHistory({
          commandExecutionType: mockCommandExecutionType,
        }),
      )

      let returnedData
      await act(async () => {
        returnedData = await result.current.getCommandsHistory(mockInstanceId)
      })

      expect(mockGetCommandsHistory).toHaveBeenCalledWith(
        mockInstanceId,
        mockCommandExecutionType,
      )
      expect(returnedData).toEqual([])
      expect(mockDispatch).toHaveBeenCalledWith(addErrorNotification(mockError))
    })
  })
})
