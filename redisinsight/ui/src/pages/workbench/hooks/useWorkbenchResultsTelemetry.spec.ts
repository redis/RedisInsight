import { renderHook } from 'uiSrc/utils/test-utils'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { useWorkbenchResultsTelemetry } from './useWorkbenchResultsTelemetry'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('useWorkbenchResultsTelemetry', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should send WORKBENCH_COMMAND_COPIED event on onCommandCopied', () => {
    const { result } = renderHook(() => useWorkbenchResultsTelemetry())

    result.current.onCommandCopied?.({
      command: 'GET key',
      databaseId: 'db-123',
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.WORKBENCH_COMMAND_COPIED,
      eventData: { databaseId: 'db-123', command: 'GET key' },
    })
  })

  it('should send WORKBENCH_CLEAR_RESULT_CLICKED event on onResultCleared', () => {
    const { result } = renderHook(() => useWorkbenchResultsTelemetry())

    result.current.onResultCleared?.({
      command: 'SET key value',
      databaseId: 'db-123',
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.WORKBENCH_CLEAR_RESULT_CLICKED,
      eventData: { databaseId: 'db-123', command: 'SET key value' },
    })
  })

  it('should send WORKBENCH_RESULTS_COLLAPSED event on onResultCollapsed', () => {
    const { result } = renderHook(() => useWorkbenchResultsTelemetry())

    result.current.onResultCollapsed?.({
      command: 'info',
      databaseId: 'db-123',
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.WORKBENCH_RESULTS_COLLAPSED,
      eventData: { databaseId: 'db-123', command: 'info' },
    })
  })

  it('should send WORKBENCH_RESULTS_EXPANDED event on onResultExpanded', () => {
    const { result } = renderHook(() => useWorkbenchResultsTelemetry())

    result.current.onResultExpanded?.({
      command: 'info',
      databaseId: 'db-123',
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.WORKBENCH_RESULTS_EXPANDED,
      eventData: { databaseId: 'db-123', command: 'info' },
    })
  })

  it('should send WORKBENCH_RESULT_VIEW_CHANGED event on onResultViewChanged', () => {
    const { result } = renderHook(() => useWorkbenchResultsTelemetry())

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
      event: TelemetryEvent.WORKBENCH_RESULT_VIEW_CHANGED,
      eventData: params,
    })
  })

  it('should send WORKBENCH_RESULTS_IN_FULL_SCREEN event on onFullScreenToggled', () => {
    const { result } = renderHook(() => useWorkbenchResultsTelemetry())

    result.current.onFullScreenToggled?.({
      state: 'Open',
      databaseId: 'db-123',
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.WORKBENCH_RESULTS_IN_FULL_SCREEN,
      eventData: { databaseId: 'db-123', state: 'Open' },
    })
  })
})
