import type { RenderHookResult } from '@testing-library/react'
import { merge } from 'lodash'
import {
  act,
  initialStateDefault,
  mockStore,
  renderHook,
} from 'uiSrc/utils/test-utils'

import { useQuery } from './useQuery'
import {
  sendWbQueryAction,
  deleteWBCommandAction,
  clearWbResultsAction,
  fetchWBCommandAction,
  toggleOpenWBResult,
} from 'uiSrc/slices/workbench/wb-results'
import {
  CommandExecutionType,
  ResultsMode,
  RunQueryMode,
} from 'uiSrc/slices/interfaces'

// Helper types for strong typing of renderHook result
type UseQueryReturn = ReturnType<typeof useQuery>
type UseQueryHookResult = RenderHookResult<UseQueryReturn, unknown>

// Mock the Redux actions
jest.mock('uiSrc/slices/workbench/wb-results', () => ({
  ...jest.requireActual('uiSrc/slices/workbench/wb-results'),
  fetchWBHistoryAction: jest.fn(() => ({ type: 'FETCH_WB_HISTORY' })),
  sendWbQueryAction: jest.fn(() => ({ type: 'SEND_WB_QUERY' })),
  deleteWBCommandAction: jest.fn(() => ({ type: 'DELETE_WB_COMMAND' })),
  clearWbResultsAction: jest.fn(() => ({ type: 'CLEAR_WB_RESULTS' })),
  fetchWBCommandAction: jest.fn(() => ({ type: 'FETCH_WB_COMMAND' })),
  toggleOpenWBResult: jest.fn(() => ({ type: 'TOGGLE_OPEN_WB_RESULT' })),
}))

describe('useQuery hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return initial state with empty items', () => {
    const customStore = mockStore(
      merge({}, initialStateDefault, {
        workbench: {
          results: {
            items: [],
            clearing: false,
            processing: false,
            loading: false,
            error: '',
            isLoaded: false,
          },
        },
      }),
    )

    const { result } = renderHook(() => useQuery(), {
      store: customStore,
    }) as unknown as UseQueryHookResult

    expect(result.current.items).toEqual([])
    expect(result.current.clearing).toBe(false)
    expect(result.current.processing).toBe(false)
    expect(result.current.isResultsLoaded).toBe(false)
  })

  it('should return items from Redux store', () => {
    const mockItems = [
      { id: 'item-1', command: 'FT.SEARCH idx *', result: { data: 'result1' } },
      { id: 'item-2', command: 'FT.INFO idx', result: { data: 'result2' } },
    ]

    const customStore = mockStore(
      merge({}, initialStateDefault, {
        workbench: {
          results: {
            items: mockItems,
            clearing: false,
            processing: false,
            loading: false,
            error: '',
            isLoaded: true,
          },
        },
      }),
    )

    const { result } = renderHook(() => useQuery(), {
      store: customStore,
    }) as unknown as UseQueryHookResult

    expect(result.current.items).toEqual(mockItems)
    expect(result.current.items).toHaveLength(2)
    expect(result.current.isResultsLoaded).toBe(true)
  })

  it('should dispatch fetchWBHistoryAction on mount', () => {
    const customStore = mockStore(initialStateDefault)

    renderHook(() => useQuery(), {
      store: customStore,
    })

    const actions = customStore.getActions()
    expect(actions).toContainEqual(
      expect.objectContaining({
        type: 'FETCH_WB_HISTORY',
      }),
    )
  })

  it('should dispatch sendWbQueryAction when onSubmit is called with a command', async () => {
    const customStore = mockStore(initialStateDefault)

    const { result } = renderHook(() => useQuery(), {
      store: customStore,
    }) as unknown as UseQueryHookResult

    await act(async () => {
      result.current.setQuery('FT.SEARCH idx *')
      await result.current.onSubmit('FT.SEARCH idx *')
    })

    expect(sendWbQueryAction).toHaveBeenCalledWith(
      'FT.SEARCH idx *',
      undefined,
      expect.objectContaining({
        executionType: CommandExecutionType.Search,
      }),
      expect.objectContaining({
        afterAll: expect.any(Function),
      }),
    )
  })

  it('should not dispatch sendWbQueryAction when onSubmit is called with empty command', async () => {
    const customStore = mockStore(initialStateDefault)

    const { result } = renderHook(() => useQuery(), {
      store: customStore,
    }) as unknown as UseQueryHookResult

    const initialActionsCount = customStore.getActions().length

    await act(async () => {
      await result.current.onSubmit('')
    })

    const actions = customStore.getActions()
    expect(actions).toHaveLength(initialActionsCount)
    expect(sendWbQueryAction).not.toHaveBeenCalled()
  })

  it('should dispatch deleteWBCommandAction when onQueryDelete is called', async () => {
    const customStore = mockStore(initialStateDefault)

    const { result } = renderHook(() => useQuery(), {
      store: customStore,
    }) as unknown as UseQueryHookResult

    await act(async () => {
      await result.current.onQueryDelete('cmd-123')
    })

    expect(deleteWBCommandAction).toHaveBeenCalledWith('cmd-123')
  })

  it('should dispatch clearWbResultsAction when onAllQueriesDelete is called', async () => {
    const customStore = mockStore(initialStateDefault)

    const { result } = renderHook(() => useQuery(), {
      store: customStore,
    }) as unknown as UseQueryHookResult

    await act(async () => {
      await result.current.onAllQueriesDelete()
    })

    expect(clearWbResultsAction).toHaveBeenCalledWith(
      CommandExecutionType.Search,
    )
  })

  it('should dispatch toggleOpenWBResult when onQueryOpen is called for item with result', async () => {
    const mockItems = [
      { id: 'item-1', command: 'FT.SEARCH', result: { data: 'some data' } },
    ]

    const customStore = mockStore(
      merge({}, initialStateDefault, {
        workbench: {
          results: {
            items: mockItems,
            clearing: false,
            processing: false,
            loading: false,
            error: '',
            isLoaded: true,
          },
        },
      }),
    )

    const { result } = renderHook(() => useQuery(), {
      store: customStore,
    }) as unknown as UseQueryHookResult

    await act(async () => {
      await result.current.onQueryOpen('item-1')
    })

    expect(toggleOpenWBResult).toHaveBeenCalledWith('item-1')
  })

  it('should dispatch fetchWBCommandAction when onQueryOpen is called for item without result', async () => {
    const mockItems = [{ id: 'item-1', command: 'FT.SEARCH', result: null }]

    const customStore = mockStore(
      merge({}, initialStateDefault, {
        workbench: {
          results: {
            items: mockItems,
            clearing: false,
            processing: false,
            loading: false,
            error: '',
            isLoaded: true,
          },
        },
      }),
    )

    const { result } = renderHook(() => useQuery(), {
      store: customStore,
    }) as unknown as UseQueryHookResult

    await act(async () => {
      await result.current.onQueryOpen('item-1')
    })

    expect(fetchWBCommandAction).toHaveBeenCalledWith('item-1')
  })

  it('should reflect processing state from Redux store', () => {
    const customStore = mockStore(
      merge({}, initialStateDefault, {
        workbench: {
          results: {
            items: [],
            clearing: false,
            processing: true,
            loading: false,
            error: '',
            isLoaded: true,
          },
        },
      }),
    )

    const { result } = renderHook(() => useQuery(), {
      store: customStore,
    }) as unknown as UseQueryHookResult

    expect(result.current.processing).toBe(true)
  })

  it('should reflect clearing state from Redux store', () => {
    const customStore = mockStore(
      merge({}, initialStateDefault, {
        workbench: {
          results: {
            items: [],
            clearing: true,
            processing: false,
            loading: false,
            error: '',
            isLoaded: true,
          },
        },
      }),
    )

    const { result } = renderHook(() => useQuery(), {
      store: customStore,
    }) as unknown as UseQueryHookResult

    expect(result.current.clearing).toBe(true)
  })

  it('should return correct configuration values', () => {
    const customStore = mockStore(initialStateDefault)

    const { result } = renderHook(() => useQuery(), {
      store: customStore,
    }) as unknown as UseQueryHookResult

    expect(result.current.activeMode).toBe(RunQueryMode.ASCII)
    expect(result.current.resultsMode).toBe(ResultsMode.Default)
    expect(result.current.scrollDivRef).toBeDefined()
    expect(result.current.scrollDivRef.current).toBeNull()
  })

  it('should allow query state to be updated', () => {
    const customStore = mockStore(initialStateDefault)

    const { result } = renderHook(() => useQuery(), {
      store: customStore,
    }) as unknown as UseQueryHookResult

    expect(result.current.query).toBe('')

    act(() => {
      result.current.setQuery('FT.SEARCH idx *')
    })

    expect(result.current.query).toBe('FT.SEARCH idx *')
  })

  it('should call onSubmit with current query when onQueryReRun is called', async () => {
    const customStore = mockStore(initialStateDefault)

    const { result } = renderHook(() => useQuery(), {
      store: customStore,
    }) as unknown as UseQueryHookResult

    act(() => {
      result.current.setQuery('FT.SEARCH idx *')
    })

    await act(async () => {
      await result.current.onQueryReRun('FT.SEARCH idx *')
    })

    expect(sendWbQueryAction).toHaveBeenCalledWith(
      'FT.SEARCH idx *',
      undefined,
      expect.objectContaining({
        executionType: CommandExecutionType.Search,
      }),
      expect.any(Object),
    )
  })

  it('should handle scrollDivRef correctly', () => {
    const customStore = mockStore(initialStateDefault)

    const { result } = renderHook(() => useQuery(), {
      store: customStore,
    }) as unknown as UseQueryHookResult

    expect(result.current.scrollDivRef).toBeDefined()
    expect(result.current.scrollDivRef.current).toBeNull()

    // Simulate attaching a div element
    const mockDiv = document.createElement('div')
    act(() => {
      Object.defineProperty(result.current.scrollDivRef, 'current', {
        value: mockDiv,
        writable: true,
      })
    })

    expect(result.current.scrollDivRef.current).toBe(mockDiv)
  })
})
