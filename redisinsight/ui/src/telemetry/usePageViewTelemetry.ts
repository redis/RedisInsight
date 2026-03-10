import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { sendPageViewTelemetry, TelemetryPageView } from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'

interface PageViewTelemetryProps {
  page: TelemetryPageView
  eventData?: Record<string, unknown>
  ready?: boolean
}

interface PageViewTelemetryHook {
  sendPageView: (page: TelemetryPageView, instanceId: string) => void
}

export const usePageViewTelemetry = ({
  page,
  eventData,
  ready = true,
}: PageViewTelemetryProps): PageViewTelemetryHook => {
  const [isPageViewSent, setIsPageViewSent] = useState(false)
  const { id: instanceId } = useSelector(connectedInstanceSelector)

  useEffect(() => {
    if (instanceId && ready && !isPageViewSent) {
      sendPageViewTelemetry({
        name: page,
        eventData: {
          databaseId: instanceId,
          ...eventData,
        },
      })
      setIsPageViewSent(true)
    }
  }, [instanceId, ready, isPageViewSent])

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
