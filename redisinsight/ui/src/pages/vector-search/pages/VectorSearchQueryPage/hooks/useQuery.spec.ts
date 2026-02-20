import type { RenderHookResult } from '@testing-library/react'
import { act, renderHook, waitFor } from 'uiSrc/utils/test-utils'

import * as hookUtils from './useQuery.utils'
import * as sharedUtils from 'uiSrc/utils'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import { commandExecutionUIFactory } from 'uiSrc/mocks/factories/workbench/commandExectution.factory'

import { useQuery } from './useQuery'

type UseQueryReturn = ReturnType<typeof useQuery>
type UseQueryHookResult = RenderHookResult<UseQueryReturn, unknown>

jest.mock('./useQuery.utils', () => ({
  sortCommandsByDate: jest.fn((items) => items),
  prepareNewItems: jest.fn(),
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

const mockGetCommandsHistory = jest.fn()
const mockGetCommandHistory = jest.fn()
const mockAddCommandsToHistory = jest.fn()
const mockDeleteCommandFromHistory = jest.fn()
const mockClearCommandsHistory = jest.fn()

jest.mock('uiSrc/services/commands-history/commandsHistoryService', () => ({
  CommandsHistoryService: jest.fn().mockImplementation(() => ({
    getCommandsHistory: mockGetCommandsHistory,
    getCommandHistory: mockGetCommandHistory,
    addCommandsToHistory: mockAddCommandsToHistory,
    deleteCommandFromHistory: mockDeleteCommandFromHistory,
    clearCommandsHistory: mockClearCommandsHistory,
  })),
}))

jest.mock('uiSrc/utils', () => ({
  ...jest.requireActual('uiSrc/utils'),
  getCommandsForExecution: jest.fn(),
  getExecuteParams: jest.fn((_, current) => ({ ...current })),
  isGroupResults: jest.fn(() => false),
  isSilentMode: jest.fn(() => false),
}))

const mockedHookUtils = jest.mocked(hookUtils)
const mockedSharedUtils = jest.mocked(sharedUtils)

describe('useQuery hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetCommandsHistory.mockResolvedValue([])
    mockGetCommandHistory.mockResolvedValue(null)
    mockAddCommandsToHistory.mockResolvedValue([])
    mockDeleteCommandFromHistory.mockResolvedValue(undefined)
    mockClearCommandsHistory.mockResolvedValue(undefined)
  })

  it('should initialize with default state', async () => {
    const { result } = renderHook(() =>
      useQuery(),
    ) as unknown as UseQueryHookResult

    await waitFor(() => expect(result.current.isResultsLoaded).toBe(true))

    expect(result.current.query).toBe('')
    expect(result.current.items).toEqual([])
    expect(result.current.clearing).toBe(false)
    expect(result.current.processing).toBe(false)
  })

  it('should load history on mount', async () => {
    const historyItems = [commandExecutionUIFactory.build()]
    mockGetCommandsHistory.mockResolvedValue(historyItems)

    const { result } = renderHook(() =>
      useQuery(),
    ) as unknown as UseQueryHookResult

    await waitFor(() => expect(result.current.isResultsLoaded).toBe(true))
    expect(result.current.items).toEqual(historyItems)
    expect(mockGetCommandsHistory).toHaveBeenCalledWith('instanceId')
  })

  it('should set isLoaded on history load error', async () => {
    mockGetCommandsHistory.mockRejectedValueOnce(new Error('error'))

    const { result } = renderHook(() =>
      useQuery(),
    ) as unknown as UseQueryHookResult

    await waitFor(() => expect(result.current.isResultsLoaded).toBe(true))
    expect(result.current.items).toEqual([])
  })

  it('should submit a command and update items on success', async () => {
    const apiData = [{ id: 'cmd-1230', result: 'PONG' }] as any

    mockGetCommandsHistory.mockResolvedValue([])
    mockAddCommandsToHistory.mockResolvedValue(apiData)

    mockedSharedUtils.getCommandsForExecution.mockReturnValueOnce(['PING'])
    mockedHookUtils.prepareNewItems.mockImplementationOnce(
      (cmds: string[], id: string) =>
        cmds.map((_, i) => ({
          id: `${id}${i}`,
          loading: true,
          isOpen: false,
          error: '',
        })),
    )

    const { result } = renderHook(() =>
      useQuery(),
    ) as unknown as UseQueryHookResult

    await waitFor(() => expect(result.current.isResultsLoaded).toBe(true))

    await act(async () => {
      await result.current.onSubmit('PING')
    })

    expect(result.current.items[0]).toMatchObject({
      id: 'cmd-1230',
      result: 'PONG',
      loading: false,
      error: '',
      isOpen: true,
    })
    expect(mockedHookUtils.scrollToElement).toHaveBeenCalled()
    expect(result.current.processing).toBe(false)
  })

  it('should handle API error on submit', async () => {
    mockGetCommandsHistory.mockResolvedValue([])
    mockAddCommandsToHistory.mockRejectedValue(new Error('api failed'))
    mockedSharedUtils.getCommandsForExecution.mockReturnValueOnce(['PING'])
    mockedHookUtils.prepareNewItems.mockImplementationOnce(
      (cmds: string[], id: string) =>
        cmds.map((_, i) => ({
          id: `${id}${i}`,
          loading: true,
          isOpen: false,
          error: '',
        })),
    )

    const { result } = renderHook(() =>
      useQuery(),
    ) as unknown as UseQueryHookResult
    await waitFor(() => expect(result.current.isResultsLoaded).toBe(true))

    await act(async () => {
      await result.current.onSubmit('PING')
    })

    expect(result.current.items[0]).toMatchObject({
      loading: false,
      isOpen: true,
      error: 'api failed',
      result: { error: 'api failed' },
    })
    expect(result.current.processing).toBe(false)
  })

  it('should not submit empty command', async () => {
    mockGetCommandsHistory.mockResolvedValue([])

    const { result } = renderHook(() =>
      useQuery(),
    ) as unknown as UseQueryHookResult
    await waitFor(() => expect(result.current.isResultsLoaded).toBe(true))

    await act(async () => {
      await result.current.onSubmit('')
    })

    expect(mockAddCommandsToHistory).not.toHaveBeenCalled()
  })

  it('should delete a query', async () => {
    const historyItems = [commandExecutionUIFactory.build({ id: 'to-delete' })]
    mockGetCommandsHistory.mockResolvedValue(historyItems)
    mockDeleteCommandFromHistory.mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useQuery(),
    ) as unknown as UseQueryHookResult
    await waitFor(() => expect(result.current.isResultsLoaded).toBe(true))

    await act(async () => {
      await result.current.onQueryDelete('to-delete')
    })

    expect(mockDeleteCommandFromHistory).toHaveBeenCalledWith(
      'instanceId',
      'to-delete',
    )
    expect(result.current.items).toEqual([])
  })

  it('should clear all queries', async () => {
    const historyItems = commandExecutionUIFactory.buildList(3)
    mockGetCommandsHistory.mockResolvedValue(historyItems)
    mockClearCommandsHistory.mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useQuery(),
    ) as unknown as UseQueryHookResult
    await waitFor(() => expect(result.current.isResultsLoaded).toBe(true))

    await act(async () => {
      await result.current.onAllQueriesDelete()
    })

    expect(mockClearCommandsHistory).toHaveBeenCalledWith('instanceId')
    expect(result.current.items).toEqual([])
    expect(result.current.clearing).toBe(false)
  })

  describe('onToggleOpen', () => {
    it('should toggle item closed when isOpen is false', async () => {
      const historyItems = [
        commandExecutionUIFactory.build({
          id: 'item-1',
          isOpen: true,
          result: [
            { response: 'data', status: CommandExecutionStatus.Success },
          ],
        }),
      ]
      mockGetCommandsHistory.mockResolvedValue(historyItems)

      const { result } = renderHook(() =>
        useQuery(),
      ) as unknown as UseQueryHookResult
      await waitFor(() => expect(result.current.isResultsLoaded).toBe(true))

      await act(async () => {
        await result.current.onToggleOpen('item-1', false)
      })

      expect(result.current.items[0]).toMatchObject({
        id: 'item-1',
        isOpen: false,
      })
      expect(mockGetCommandHistory).not.toHaveBeenCalled()
    })

    it('should fetch and open item when opening and result is missing', async () => {
      const historyItems = [
        commandExecutionUIFactory.build({
          id: 'item-2',
          isOpen: false,
          result: undefined,
        }),
      ]
      mockGetCommandsHistory.mockResolvedValue(historyItems)
      mockGetCommandHistory.mockResolvedValueOnce({
        id: 'item-2',
        result: 'fetched-data',
        error: '',
        loading: false,
        isOpen: false,
      })

      const { result } = renderHook(() =>
        useQuery(),
      ) as unknown as UseQueryHookResult
      await waitFor(() => expect(result.current.isResultsLoaded).toBe(true))

      await act(async () => {
        await result.current.onToggleOpen('item-2', true)
      })

      expect(mockGetCommandHistory).toHaveBeenCalledWith('instanceId', 'item-2')
      expect(result.current.items[0]).toMatchObject({
        id: 'item-2',
        loading: false,
        isOpen: true,
        result: 'fetched-data',
      })
    })

    it('should open item directly when result already exists', async () => {
      const historyItems = [
        commandExecutionUIFactory.build({
          id: 'item-3',
          isOpen: false,
          result: [
            { response: 'existing', status: CommandExecutionStatus.Success },
          ],
        }),
      ]
      mockGetCommandsHistory.mockResolvedValue(historyItems)

      const { result } = renderHook(() =>
        useQuery(),
      ) as unknown as UseQueryHookResult
      await waitFor(() => expect(result.current.isResultsLoaded).toBe(true))

      await act(async () => {
        await result.current.onToggleOpen('item-3', true)
      })

      expect(mockGetCommandHistory).not.toHaveBeenCalled()
      expect(result.current.items[0]).toMatchObject({
        id: 'item-3',
        isOpen: true,
      })
    })

    it('should set error when fetch fails on toggle open', async () => {
      const historyItems = [
        commandExecutionUIFactory.build({
          id: 'item-4',
          isOpen: false,
          result: undefined,
        }),
      ]
      mockGetCommandsHistory.mockResolvedValue(historyItems)
      mockGetCommandHistory.mockRejectedValueOnce(new Error('load failed'))

      const { result } = renderHook(() =>
        useQuery(),
      ) as unknown as UseQueryHookResult
      await waitFor(() => expect(result.current.isResultsLoaded).toBe(true))

      await act(async () => {
        await result.current.onToggleOpen('item-4', true)
      })

      expect(result.current.items[0]).toMatchObject({
        id: 'item-4',
        loading: false,
        error: 'Failed to load command details',
      })
    })
  })
})
