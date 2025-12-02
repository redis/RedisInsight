import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

export const sendCopyTelemetry = async (databaseId?: string) => {
  return sendEventTelemetry({
    event: TelemetryEvent.CONFIG_DATABASES_HOST_PORT_COPIED,
    eventData: {
      databaseId,
    },
  })
}

export const handleCopyToClipboard = (
  e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  text = '',
  databaseId?: string,
) => {
  e.stopPropagation()
  navigator.clipboard?.writeText(text)
  sendCopyTelemetry(databaseId)
}
