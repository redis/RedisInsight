import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

export const handleCopyToClipboard = (
  e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  text = '',
  databaseId?: string,
) => {
  e.stopPropagation()
  navigator.clipboard?.writeText(text)
  sendEventTelemetry({
    event: TelemetryEvent.CONFIG_DATABASES_HOST_PORT_COPIED,
    eventData: {
      databaseId,
    },
  })
}
