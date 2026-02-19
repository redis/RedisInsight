import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { searchResultsTelemetry } from './telemetry.constants'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('searchResultsTelemetry', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should send SEARCH_COMMAND_COPIED event on onCommandCopied', () => {
    searchResultsTelemetry.onCommandCopied?.({
      command: 'FT.SEARCH idx query',
      databaseId: 'db-123',
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_COMMAND_COPIED,
      eventData: { databaseId: 'db-123', command: 'FT.SEARCH idx query' },
    })
  })

  it('should send SEARCH_CLEAR_RESULT_CLICKED event on onResultCleared', () => {
    searchResultsTelemetry.onResultCleared?.({
      command: 'FT.SEARCH idx query',
      databaseId: 'db-123',
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_CLEAR_RESULT_CLICKED,
      eventData: { databaseId: 'db-123', command: 'FT.SEARCH idx query' },
    })
  })

  it('should send SEARCH_RESULTS_COLLAPSED event on onResultCollapsed', () => {
    searchResultsTelemetry.onResultCollapsed?.({
      command: 'FT.SEARCH idx query',
      databaseId: 'db-123',
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_RESULTS_COLLAPSED,
      eventData: { databaseId: 'db-123', command: 'FT.SEARCH idx query' },
    })
  })

  it('should send SEARCH_RESULTS_EXPANDED event on onResultExpanded', () => {
    searchResultsTelemetry.onResultExpanded?.({
      command: 'FT.SEARCH idx query',
      databaseId: 'db-123',
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_RESULTS_EXPANDED,
      eventData: { databaseId: 'db-123', command: 'FT.SEARCH idx query' },
    })
  })

  it('should send SEARCH_RESULT_VIEW_CHANGED event on onResultViewChanged', () => {
    const params = {
      databaseId: 'db-123',
      command: 'FT.SEARCH',
      rawMode: false,
      group: false,
      previousView: 'Text',
      currentView: 'Plugin',
    }

    searchResultsTelemetry.onResultViewChanged?.(params)

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_RESULT_VIEW_CHANGED,
      eventData: params,
    })
  })

  it('should send SEARCH_RESULTS_IN_FULL_SCREEN event on onFullScreenToggled', () => {
    searchResultsTelemetry.onFullScreenToggled?.({
      state: 'Open',
      databaseId: 'db-123',
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_RESULTS_IN_FULL_SCREEN,
      eventData: { databaseId: 'db-123', state: 'Open' },
    })
  })

  it('should send SEARCH_COMMAND_RUN_AGAIN event on onQueryReRun', () => {
    searchResultsTelemetry.onQueryReRun?.({
      command: 'FT.SEARCH idx query',
      databaseId: 'db-123',
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_COMMAND_RUN_AGAIN,
      eventData: { databaseId: 'db-123', commands: ['FT.SEARCH idx query'] },
    })
  })
})
