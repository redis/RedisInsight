import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { workbenchResultsTelemetry } from './telemetry.constants'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('workbenchResultsTelemetry', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should send WORKBENCH_COMMAND_COPIED event on onCommandCopied', () => {
    workbenchResultsTelemetry.onCommandCopied?.({
      command: 'GET key',
      databaseId: 'db-123',
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.WORKBENCH_COMMAND_COPIED,
      eventData: { databaseId: 'db-123', command: 'GET key' },
    })
  })

  it('should send WORKBENCH_CLEAR_RESULT_CLICKED event on onResultCleared', () => {
    workbenchResultsTelemetry.onResultCleared?.({
      command: 'SET key value',
      databaseId: 'db-123',
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.WORKBENCH_CLEAR_RESULT_CLICKED,
      eventData: { databaseId: 'db-123', command: 'SET key value' },
    })
  })

  it('should send WORKBENCH_RESULTS_COLLAPSED event on onResultCollapsed', () => {
    workbenchResultsTelemetry.onResultCollapsed?.({
      command: 'info',
      databaseId: 'db-123',
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.WORKBENCH_RESULTS_COLLAPSED,
      eventData: { databaseId: 'db-123', command: 'info' },
    })
  })

  it('should send WORKBENCH_RESULTS_EXPANDED event on onResultExpanded', () => {
    workbenchResultsTelemetry.onResultExpanded?.({
      command: 'info',
      databaseId: 'db-123',
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.WORKBENCH_RESULTS_EXPANDED,
      eventData: { databaseId: 'db-123', command: 'info' },
    })
  })

  it('should send WORKBENCH_RESULT_VIEW_CHANGED event on onResultViewChanged', () => {
    const params = {
      databaseId: 'db-123',
      command: 'FT.SEARCH',
      rawMode: false,
      group: false,
      previousView: 'Text',
      currentView: 'Plugin',
    }

    workbenchResultsTelemetry.onResultViewChanged?.(params)

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.WORKBENCH_RESULT_VIEW_CHANGED,
      eventData: params,
    })
  })

  it('should send WORKBENCH_RESULTS_IN_FULL_SCREEN event on onFullScreenToggled', () => {
    workbenchResultsTelemetry.onFullScreenToggled?.({
      state: 'Open',
      databaseId: 'db-123',
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.WORKBENCH_RESULTS_IN_FULL_SCREEN,
      eventData: { databaseId: 'db-123', state: 'Open' },
    })
  })
})
