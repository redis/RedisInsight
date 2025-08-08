import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { sendPageViewTelemetry, TelemetryPageView } from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'

interface PageViewTelemetryProps {
  page: TelemetryPageView
}

interface PageViewTelemetryHook {
  sendPageView: (page: TelemetryPageView, instanceId: string) => void // Let the developers manually send page view telemetry, with custom parameters when needed
}

export const usePageViewTelemetry = ({
  page,
}: PageViewTelemetryProps): PageViewTelemetryHook => {
  const [isPageViewSent, setIsPageViewSent] = useState(false)
  const { id: instanceId } = useSelector(connectedInstanceSelector)

  // By default, send page view telemetry on page mount if instanceId is available
  useEffect(() => {
    if (instanceId && !isPageViewSent) {
      sendPageView(page, instanceId)
    }
  }, [instanceId, isPageViewSent])

  const sendPageView = (page: TelemetryPageView, instanceId: string) => {
    sendPageViewTelemetry({
      name: page,
      eventData: {
        databaseId: instanceId,
      },
    })
    setIsPageViewSent(true)
  }

  return {
    sendPageView,
  }
}
