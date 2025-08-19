import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { EventData } from 'uiSrc/telemetry/interfaces'

export const useTelemetryMountEvent = (
  onMountEvent: TelemetryEvent,
  onUnmountEvent?: TelemetryEvent,
  eventData?: EventData,
) => {
  const { instanceId } = useParams<{ instanceId: string }>()

  useEffect(() => {
    sendEventTelemetry({
      event: onMountEvent,
      eventData: {
        databaseId: instanceId,
        ...eventData,
      },
    })

    return () => {
      onUnmountEvent &&
        sendEventTelemetry({
          event: onUnmountEvent,
          eventData: {
            databaseId: instanceId,
            ...eventData,
          },
        })
    }
  }, [])
}
