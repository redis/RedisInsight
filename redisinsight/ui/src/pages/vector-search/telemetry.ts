import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

interface CollectTelemetry {
  instanceId: string
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
