import { useMemo } from 'react'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { QueryResultsTelemetry } from 'uiSrc/components/query/context/query-results.context'

export const useWorkbenchResultsTelemetry = (): QueryResultsTelemetry =>
  useMemo(
    () => ({
      onCommandCopied: ({ command, databaseId }) => {
        sendEventTelemetry({
          event: TelemetryEvent.WORKBENCH_COMMAND_COPIED,
          eventData: { databaseId, command },
        })
      },
      onResultCleared: ({ command, databaseId }) => {
        sendEventTelemetry({
          event: TelemetryEvent.WORKBENCH_CLEAR_RESULT_CLICKED,
          eventData: { databaseId, command },
        })
      },
      onResultCollapsed: ({ command, databaseId }) => {
        sendEventTelemetry({
          event: TelemetryEvent.WORKBENCH_RESULTS_COLLAPSED,
          eventData: { databaseId, command },
        })
      },
      onResultExpanded: ({ command, databaseId }) => {
        sendEventTelemetry({
          event: TelemetryEvent.WORKBENCH_RESULTS_EXPANDED,
          eventData: { databaseId, command },
        })
      },
      onResultViewChanged: (params) => {
        sendEventTelemetry({
          event: TelemetryEvent.WORKBENCH_RESULT_VIEW_CHANGED,
          eventData: params,
        })
      },
      onFullScreenToggled: ({ state, databaseId }) => {
        sendEventTelemetry({
          event: TelemetryEvent.WORKBENCH_RESULTS_IN_FULL_SCREEN,
          eventData: { databaseId, state },
        })
      },
      onQueryReRun: ({ command, databaseId }) => {
        sendEventTelemetry({
          event: TelemetryEvent.WORKBENCH_COMMAND_RUN_AGAIN,
          eventData: { databaseId, command },
        })
      },
    }),
    [],
  )
