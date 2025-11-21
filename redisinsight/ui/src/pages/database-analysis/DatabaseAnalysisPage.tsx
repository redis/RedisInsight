import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import {
  dbAnalysisReportsSelector,
  dbAnalysisSelector,
  fetchDBAnalysisAction,
  fetchDBAnalysisReportsHistory,
  setSelectedAnalysisId,
} from 'uiSrc/slices/analytics/dbAnalysis'
import {
  analyticsSettingsSelector,
  setAnalyticsViewTab,
} from 'uiSrc/slices/analytics/settings'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { AnalyticsViewTab } from 'uiSrc/slices/interfaces/analytics'
import {
  sendEventTelemetry,
  sendPageViewTelemetry,
  TelemetryEvent,
  TelemetryPageView,
} from 'uiSrc/telemetry'
import { formatLongName, getDbIndex, setTitle } from 'uiSrc/utils'
import { DatabaseAnalysisPageView } from './DatabaseAnalysisPageView'

export const DatabaseAnalysisPage = () => {
  const { viewTab } = useSelector(analyticsSettingsSelector)
  const { loading: analysisLoading, data } = useSelector(dbAnalysisSelector)
  const { data: reports, selectedAnalysis } = useSelector(
    dbAnalysisReportsSelector,
  )
  const {
    name: connectedInstanceName,
    db,
    provider,
  } = useSelector(connectedInstanceSelector)

  const { instanceId } = useParams<{ instanceId: string }>()

  const [isPageViewSent, setIsPageViewSent] = useState<boolean>(false)

  const dispatch = useDispatch()
  const dbName = `${formatLongName(connectedInstanceName, 33, 0, '...')} ${getDbIndex(db)}`
  setTitle(`${dbName} - Database Analysis`)

  useEffect(() => {
    dispatch(fetchDBAnalysisReportsHistory(instanceId))

    if (viewTab !== AnalyticsViewTab.DatabaseAnalysis) {
      dispatch(setAnalyticsViewTab(AnalyticsViewTab.DatabaseAnalysis))
    }
  }, [])

  useEffect(() => {
    if (!selectedAnalysis && reports?.length) {
      dispatch(setSelectedAnalysisId(reports[0].id!))
      dispatch(fetchDBAnalysisAction(instanceId, reports[0].id!))
    }
  }, [selectedAnalysis, reports])

  const handleSelectAnalysis = (reportId: string) => {
    sendEventTelemetry({
      event: TelemetryEvent.DATABASE_ANALYSIS_HISTORY_VIEWED,
      eventData: {
        databaseId: instanceId,
        provider,
      },
    })
    dispatch(setSelectedAnalysisId(reportId))
    dispatch(fetchDBAnalysisAction(instanceId, reportId))
  }

  useEffect(() => {
    if (connectedInstanceName && !isPageViewSent) {
      sendPageView(instanceId)
    }
  }, [connectedInstanceName, isPageViewSent])

  const sendPageView = (instanceId: string) => {
    sendPageViewTelemetry({
      name: TelemetryPageView.DATABASE_ANALYSIS,
      eventData: {
        databaseId: instanceId,
      },
    })
    setIsPageViewSent(true)
  }

  return (
    <DatabaseAnalysisPageView
      reports={reports}
      selectedAnalysis={selectedAnalysis}
      analysisLoading={analysisLoading}
      data={data}
      handleSelectAnalysis={handleSelectAnalysis}
    />
  )
}

export default DatabaseAnalysisPage
