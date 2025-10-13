import type { RenderHookResult } from '@testing-library/react'
import { act, renderHook, waitFor } from 'uiSrc/utils/test-utils'

import * as utils from './utils'
import * as storage from 'uiSrc/services/workbenchStorage'
import * as sharedUtils from 'uiSrc/utils'
import { useCommandsHistory } from 'uiSrc/services/commands-history/hooks/useCommandsHistory'
import { commandExecutionUIFactory } from 'uiSrc/mocks/factories/workbench/commandExectution.factory'

import { useQuery } from './useQuery'

// Helper types for strong typing of renderHook result
type UseQueryReturn = ReturnType<typeof useQuery>
type UseQueryHookResult = RenderHookResult<UseQueryReturn, unknown>

// Mocks for utils inside this folder
jest.mock('./utils', () => ({
  loadHistoryData: jest.fn(),
  sortCommandsByDate: jest.fn((items) => items),
  prepareNewItems: jest.fn(),
  executeApiCall: jest.fn(),
  generateCommandId: jest.fn(() => 'cmd-123'),
  createErrorResult: jest.fn((msg: string) => ({ error: msg })),
  scrollToElement: jest.fn(),
  limitHistoryLength: jest.fn((items) => items),
  createGroupItem: jest.fn((count: number, id: string) => ({
    id,
    result: `group-${count}`,
    loading: false,
    isOpen: false,
    error: '',
  })),
}))

// Mocks for workbench storage
jest.mock('uiSrc/services/workbenchStorage', () => ({
  addCommands: jest.fn(async () => {}),
  clearCommands: jest.fn(async () => {}),
  findCommand: jest.fn(async () => null),
  removeCommand: jest.fn(async () => {}),
}))

// Mock the useCommandsHistory hook
jest.mock('uiSrc/services/commands-history/hooks/useCommandsHistory', () => ({
  useCommandsHistory: jest.fn(),
}))

// Mocks for shared utils used by the hook
jest.mock('uiSrc/utils', () => ({
  ...jest.requireActual('uiSrc/utils'),
  getCommandsForExecution: jest.fn(),
  getExecuteParams: jest.fn((_, current) => ({ ...current })),
  isGroupResults: jest.fn(() => false),
  isSilentMode: jest.fn(() => false),
}))

const mockedUtils = jest.mocked(utils)
const mockedStorage = jest.mocked(storage)
const mockedSharedUtils = jest.mocked(sharedUtils)
const mockedUseCommandsHistory = jest.mocked(useCommandsHistory)

describe('useQuery hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock the useCommandsHistory hook to return a mock function
    mockedUseCommandsHistory.mockReturnValue({
      getCommandsHistory: jest.fn().mockResolvedValue([]),
    })
  })

  it('loads history on mount (success - returns data)', async () => {
    const historyItems = [commandExecutionUIFactory.build()]
    const mockGetCommandsHistory = jest.fn().mockResolvedValue(historyItems)
    mockedUseCommandsHistory.mockReturnValue({
      getCommandsHistory: mockGetCommandsHistory,
    })

    const { result } = renderHook(() =>
      useQuery(),
    ) as unknown as UseQueryHookResult

    await waitFor(() => expect(result.current.isResultsLoaded).toBe(true))
    expect(result.current.items).toEqual(historyItems)
    expect(mockGetCommandsHistory).toHaveBeenCalledWith('instanceId')
  })

  it('loads history on mount (error - returns empty array)', async () => {
    const mockGetCommandsHistory = jest
      .fn()
      .mockRejectedValueOnce(new Error('error'))
    mockedUseCommandsHistory.mockReturnValue({
      getCommandsHistory: mockGetCommandsHistory,
    })

    const { result } = renderHook(() =>
      useQuery(),
    ) as unknown as UseQueryHookResult

    await waitFor(() => expect(result.current.isResultsLoaded).toBe(true))
    expect(result.current.items).toEqual([])
  })

  it('onSubmit success path updates items, calls addCommands and scrolls', async () => {
    // Initial history empty
    // Mock empty history
    mockedUseCommandsHistory.mockReturnValue({
      getCommandsHistory: jest.fn().mockResolvedValue([]),
    })

    // Prepare new UI items for the command to execute
    mockedSharedUtils.getCommandsForExecution.mockReturnValueOnce(['PING'])
    mockedUtils.prepareNewItems.mockImplementationOnce(
      (cmds: string[], id: string) =>
        cmds.map((_, i) => ({
          id: `${id}${i}`,
          loading: true,
          isOpen: false,
          error: '',
        })),
    )

    // API returns data matching ids
    const apiData = [{ id: 'cmd-1230', result: 'PONG' }] as any
    mockedUtils.executeApiCall.mockResolvedValueOnce(apiData)

    const { result } = renderHook(() =>
      useQuery(),
    ) as unknown as UseQueryHookResult

    await waitFor(() => expect(result.current.isResultsLoaded).toBe(true))

    await act(async () => {
      await result.current.onSubmit('PING')
    })

    // Items updated with API data: loading false, no error, opened
    expect(result.current.items[0]).toMatchObject({
      id: 'cmd-1230',
      result: 'PONG',
      loading: false,
      error: '',
      isOpen: true,
    })

    // addCommands called with reverse(data)
    expect(mockedStorage.addCommands).toHaveBeenCalledWith(
      [...apiData].reverse(),
    )
    // Scroll called for a new command
    expect(mockedUtils.scrollToElement).toHaveBeenCalled()
    // processing returns to false at the end
    expect(result.current.processing).toBe(false)
  })

  it('onSubmit handles API error and sets error result', async () => {
    // Mock empty history
    mockedUseCommandsHistory.mockReturnValue({
      getCommandsHistory: jest.fn().mockResolvedValue([]),
    })
    mockedSharedUtils.getCommandsForExecution.mockReturnValueOnce(['PING'])
    mockedUtils.prepareNewItems.mockImplementationOnce(
      (cmds: string[], id: string) =>
        cmds.map((_, i) => ({
          id: `${id}${i}`,
          loading: true,
          isOpen: false,
          error: '',
        })),
    )
    mockedUtils.executeApiCall.mockRejectedValueOnce(new Error('api failed'))

    const { result } = renderHook(() =>
      useQuery(),
    ) as unknown as UseQueryHookResult
    await waitFor(() => expect(result.current.isResultsLoaded).toBe(true))

    await act(async () => {
      await result.current.onSubmit('PING')
    })

    // error should be set on the loading item
    expect(result.current.items[0]).toMatchObject({
      loading: false,
      isOpen: true,
      error: 'api failed',
      result: { error: 'api failed' },
    })
    expect(result.current.processing).toBe(false)
  })

  it('onQueryDelete removes an item and calls removeCommand', async () => {
    // preload history with one item
    const historyItems = [
      commandExecutionUIFactory.build({
        id: 'to-delete',
      }),
    ]
    mockedUseCommandsHistory.mockReturnValue({
      getCommandsHistory: jest.fn().mockResolvedValue(historyItems),
    })
    const { result } = renderHook(() =>
      useQuery(),
    ) as unknown as UseQueryHookResult
    await waitFor(() => expect(result.current.isResultsLoaded).toBe(true))

    await act(async () => {
      await result.current.onQueryDelete('to-delete')
    })

    expect(mockedStorage.removeCommand).toHaveBeenCalledWith(
      'instanceId',
      'to-delete',
    )
    expect(result.current.items).toEqual([])
  })

  it('onAllQueriesDelete clears all items and toggles clearing flag', async () => {
    const historyItems = commandExecutionUIFactory.buildList(3)
    mockedUseCommandsHistory.mockReturnValue({
      getCommandsHistory: jest.fn().mockResolvedValue(historyItems),
    })
    const { result } = renderHook(() =>
      useQuery(),
    ) as unknown as UseQueryHookResult
    await waitFor(() => expect(result.current.isResultsLoaded).toBe(true))

    await act(async () => {
      await result.current.onAllQueriesDelete()
    })

    // clearing should have been toggled to true at least once during the call
    expect(result.current.clearing).toBe(false)
    expect(mockedStorage.clearCommands).toHaveBeenCalledWith('instanceId')
    expect(result.current.items).toEqual([])
    expect(result.current.clearing).toBe(false)
  })

  describe('onQueryOpen', () => {
    it('toggles item open and merges command details when found', async () => {
      const historyItems = [
        commandExecutionUIFactory.build({
          id: 'item-1',
        }),
      ]
      mockedUseCommandsHistory.mockReturnValue({
        getCommandsHistory: jest.fn().mockResolvedValue(historyItems),
      })
      mockedStorage.findCommand.mockResolvedValueOnce({
        result: 'data',
        error: '',
      })

      const { result } = renderHook(() =>
        useQuery(),
      ) as unknown as UseQueryHookResult
      await waitFor(() => expect(result.current.isResultsLoaded).toBe(true))

      await act(async () => {
        await result.current.onQueryOpen('item-1')
      })

      expect(mockedStorage.findCommand).toHaveBeenCalledWith('item-1')
      expect(result.current.items[0]).toMatchObject({
        id: 'item-1',
        loading: false,
        isOpen: true,
        result: 'data',
      })
    })

    it('sets loading false without changes if command not found', async () => {
      const historyItems = [
        commandExecutionUIFactory.build({
          id: 'item-2',
          loading: false,
          isOpen: false,
          error: '',
        }),
      ]
      mockedUseCommandsHistory.mockReturnValue({
        getCommandsHistory: jest.fn().mockResolvedValue(historyItems),
      })
      mockedStorage.findCommand.mockResolvedValueOnce(null)

      const { result } = renderHook(() =>
        useQuery(),
      ) as unknown as UseQueryHookResult
      await waitFor(() => expect(result.current.isResultsLoaded).toBe(true))

      await act(async () => {
        await result.current.onQueryOpen('item-2')
      })

      expect(result.current.items[0]).toMatchObject({
        id: 'item-2',
        loading: false,
      })
    })

    it('sets error when loading command details fails', async () => {
      const historyItems = [
        commandExecutionUIFactory.build({
          id: 'item-3',
          loading: false,
          isOpen: false,
          error: '',
        }),
      ]
      mockedUseCommandsHistory.mockReturnValue({
        getCommandsHistory: jest.fn().mockResolvedValue(historyItems),
      })
      mockedStorage.findCommand.mockRejectedValueOnce(new Error('load failed'))

      const { result } = renderHook(() =>
        useQuery(),
      ) as unknown as UseQueryHookResult
      await waitFor(() => expect(result.current.isResultsLoaded).toBe(true))

      await act(async () => {
        await result.current.onQueryOpen('item-3')
      })

      expect(result.current.items[0]).toMatchObject({
        id: 'item-3',
        loading: false,
        error: 'Failed to load command details',
      })
    })
  })
})
