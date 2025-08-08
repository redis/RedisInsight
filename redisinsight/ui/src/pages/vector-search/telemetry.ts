import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

interface CollectTelemetry {
  instanceId: string
}

export const collectSavedQueriesPanelToggleTelemetry = ({
  instanceId,
  isSavedQueriesOpen,
}: CollectTelemetry & {
  isSavedQueriesOpen: boolean
}): void => {
  sendEventTelemetry({
    event: isSavedQueriesOpen
      ? TelemetryEvent.SEARCH_SAVED_QUERIES_PANEL_CLOSED
      : TelemetryEvent.SEARCH_SAVED_QUERIES_PANEL_OPENED,
    eventData: {
      databaseId: instanceId,
    },
  })
}
