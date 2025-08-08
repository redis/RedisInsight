import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

interface CollectTelemetry {
  instanceId: string
}

export const collectTelemetryQueryRun = ({
  instanceId,
  query,
}: CollectTelemetry & { query: string }) => {
  sendEventTelemetry({
    event: TelemetryEvent.SEARCH_COMMAND_SUBMITTED,
    eventData: {
      databaseId: instanceId,
      commands: [query],
    },
  })
}

export const collectTelemetryQueryReRun = ({
  instanceId,
  query,
}: CollectTelemetry & { query: string }) => {
  sendEventTelemetry({
    event: TelemetryEvent.SEARCH_COMMAND_RUN_AGAIN,
    eventData: {
      databaseId: instanceId,
      commands: [query],
    },
  })
}

export const collectTelemetryQueryClearAll = ({
  instanceId,
}: CollectTelemetry) => {
  sendEventTelemetry({
    event: TelemetryEvent.SEARCH_CLEAR_ALL_RESULTS_CLICKED,
    eventData: {
      databaseId: instanceId,
    },
  })
}

export const collectTelemetryQueryClear = ({
  instanceId,
}: CollectTelemetry) => {
  sendEventTelemetry({
    event: TelemetryEvent.SEARCH_CLEAR_EDITOR_CLICKED,
    eventData: {
      databaseId: instanceId,
    },
  })
}

export const collectQueryToggleFullScreenTelemetry = ({
  instanceId,
  isFullScreen,
}: CollectTelemetry & { isFullScreen: boolean }) => {
  sendEventTelemetry({
    event: TelemetryEvent.SEARCH_RESULTS_IN_FULL_SCREEN,
    eventData: {
      databaseId: instanceId,
      state: isFullScreen ? 'Open' : 'Close',
    },
  })
}
