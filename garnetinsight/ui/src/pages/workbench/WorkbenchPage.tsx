import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { formatLongName, getDbIndex, setTitle } from 'uiSrc/utils'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendPageViewTelemetry, TelemetryPageView } from 'uiSrc/telemetry'
import WBViewWrapper from './components/wb-view'

const WorkbenchPage = () => {
  const [isPageViewSent, setIsPageViewSent] = useState(false)

  const { name: connectedInstanceName, db } = useSelector(
    connectedInstanceSelector,
  )

  const { instanceId } = useParams<{ instanceId: string }>()

  setTitle(
    `${formatLongName(connectedInstanceName, 33, 0, '...')} ${getDbIndex(db)} - Workbench`,
  )

  useEffect(() => {
    if (connectedInstanceName && !isPageViewSent) {
      sendPageView(instanceId)
    }
  }, [connectedInstanceName, isPageViewSent])

  const sendPageView = (instanceId: string) => {
    sendPageViewTelemetry({
      name: TelemetryPageView.WORKBENCH_PAGE,
      eventData: {
        databaseId: instanceId,
      },
    })
    setIsPageViewSent(true)
  }

  return <WBViewWrapper />
}

export default WorkbenchPage
