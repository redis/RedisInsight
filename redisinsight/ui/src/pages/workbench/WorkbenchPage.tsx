import React, { useEffect, useState } from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'
import { useParams } from 'react-router-dom'

import { useTranslation } from 'uiSrc/i18n'
import { formatLongName, getDbIndex, setTitle } from 'uiSrc/utils'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendPageViewTelemetry, TelemetryPageView } from 'uiSrc/telemetry'
import WBViewWrapper from './components/wb-view'

const WorkbenchPage = () => {
  const { t } = useTranslation()
  const [isPageViewSent, setIsPageViewSent] = useState(false)

  const { name: connectedInstanceName, db } = useAppSelector(
    connectedInstanceSelector,
  )

  const { instanceId } = useParams<{ instanceId: string }>()

  setTitle(
    t('workbench.pageTitle', {
      name: formatLongName(connectedInstanceName, 33, 0, '...'),
      db: getDbIndex(db),
    }),
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
