import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { QueryResultsTelemetry } from 'uiSrc/components/query/context/query-results.context'

export const searchResultsTelemetry: QueryResultsTelemetry = {
  onCommandCopied: ({ command, databaseId }) => {
    sendEventTelemetry({
      event: TelemetryEvent.SEARCH_COMMAND_COPIED,
      eventData: { databaseId, command },
    })
  },
  onResultCleared: ({ command, databaseId }) => {
    sendEventTelemetry({
      event: TelemetryEvent.SEARCH_CLEAR_RESULT_CLICKED,
      eventData: { databaseId, command },
    })
  },
  onResultCollapsed: ({ command, databaseId }) => {
    sendEventTelemetry({
      event: TelemetryEvent.SEARCH_RESULTS_COLLAPSED,
      eventData: { databaseId, command },
    })
  },
  onResultExpanded: ({ command, databaseId }) => {
    sendEventTelemetry({
      event: TelemetryEvent.SEARCH_RESULTS_EXPANDED,
      eventData: { databaseId, command },
    })
  },
  onResultViewChanged: (params) => {
    sendEventTelemetry({
      event: TelemetryEvent.SEARCH_RESULT_VIEW_CHANGED,
      eventData: params,
    })
  },
  onFullScreenToggled: ({ state, databaseId }) => {
    sendEventTelemetry({
      event: TelemetryEvent.SEARCH_RESULTS_IN_FULL_SCREEN,
      eventData: { databaseId, state },
    })
  },
  onQueryReRun: ({ command, databaseId }) => {
    sendEventTelemetry({
      event: TelemetryEvent.SEARCH_COMMAND_RUN_AGAIN,
      eventData: { databaseId, commands: [command] },
    })
  },
}
