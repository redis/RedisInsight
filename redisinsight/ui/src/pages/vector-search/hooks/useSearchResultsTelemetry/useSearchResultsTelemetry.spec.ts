import { renderHook } from 'uiSrc/utils/test-utils'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { useSearchResultsTelemetry } from './useSearchResultsTelemetry'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('useSearchResultsTelemetry', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should send SEARCH_COMMAND_COPIED event on onCommandCopied', () => {
    const { result } = renderHook(() => useSearchResultsTelemetry())

    result.current.onCommandCopied?.({
      command: 'FT.SEARCH idx query',
      databaseId: 'db-123',
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_COMMAND_COPIED,
      eventData: { databaseId: 'db-123', command: 'FT.SEARCH idx query' },
    })
  })

  it('should send SEARCH_CLEAR_RESULT_CLICKED event on onResultCleared', () => {
    const { result } = renderHook(() => useSearchResultsTelemetry())

    result.current.onResultCleared?.({
      command: 'FT.SEARCH idx query',
      databaseId: 'db-123',
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_CLEAR_RESULT_CLICKED,
      eventData: { databaseId: 'db-123', command: 'FT.SEARCH idx query' },
    })
  })

  it('should send SEARCH_RESULTS_COLLAPSED event on onResultCollapsed', () => {
    const { result } = renderHook(() => useSearchResultsTelemetry())

    result.current.onResultCollapsed?.({
      command: 'FT.SEARCH idx query',
      databaseId: 'db-123',
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_RESULTS_COLLAPSED,
      eventData: { databaseId: 'db-123', command: 'FT.SEARCH idx query' },
    })
  })

  it('should send SEARCH_RESULTS_EXPANDED event on onResultExpanded', () => {
    const { result } = renderHook(() => useSearchResultsTelemetry())

    result.current.onResultExpanded?.({
      command: 'FT.SEARCH idx query',
      databaseId: 'db-123',
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_RESULTS_EXPANDED,
      eventData: { databaseId: 'db-123', command: 'FT.SEARCH idx query' },
    })
  })

  it('should send SEARCH_RESULT_VIEW_CHANGED event on onResultViewChanged', () => {
    const { result } = renderHook(() => useSearchResultsTelemetry())

    const params = {
      databaseId: 'db-123',
      command: 'FT.SEARCH',
      rawMode: false,
      group: false,
      previousView: 'Text',
      currentView: 'Plugin',
    }

    result.current.onResultViewChanged?.(params)

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_RESULT_VIEW_CHANGED,
      eventData: params,
    })
  })

  it('should send SEARCH_RESULTS_IN_FULL_SCREEN event on onFullScreenToggled', () => {
    const { result } = renderHook(() => useSearchResultsTelemetry())

    result.current.onFullScreenToggled?.({
      state: 'Open',
      databaseId: 'db-123',
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_RESULTS_IN_FULL_SCREEN,
      eventData: { databaseId: 'db-123', state: 'Open' },
    })
  })

  it('should send SEARCH_COMMAND_RUN_AGAIN event on onQueryReRun', () => {
    const { result } = renderHook(() => useSearchResultsTelemetry())

    result.current.onQueryReRun?.({
      command: 'FT.SEARCH idx query',
      databaseId: 'db-123',
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_COMMAND_RUN_AGAIN,
      eventData: { databaseId: 'db-123', commands: ['FT.SEARCH idx query'] },
    })
  })
})
