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

export const collectChangedSavedQueryIndexTelemetry = ({
  instanceId,
}: CollectTelemetry): void => {
  sendEventTelemetry({
    event: TelemetryEvent.SEARCH_SAVED_QUERIES_INDEX_CHANGED,
    eventData: {
      databaseId: instanceId,
    },
  })
}

export const collectInsertSavedQueryTelemetry = ({
  instanceId,
}: CollectTelemetry): void => {
  sendEventTelemetry({
    event: TelemetryEvent.SEARCH_SAVED_QUERIES_INSERT_CLICKED,
    eventData: {
      databaseId: instanceId,
    },
  })
}
