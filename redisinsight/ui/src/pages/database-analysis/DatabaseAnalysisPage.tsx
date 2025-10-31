import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import {
  dbAnalysisSelector,
  dbAnalysisReportsSelector,
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
  sendPageViewTelemetry,
  sendEventTelemetry,
  TelemetryPageView,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { formatLongName, getDbIndex, setTitle } from 'uiSrc/utils'

import Header from './components/header'
import DatabaseAnalysisTabs from './components/data-nav-tabs'
import styles from './styles.module.scss'

// Styled component for the main container with theme border
const MainContainer = styled.div<React.HTMLAttributes<HTMLDivElement>>`
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  border-radius: ${({ theme }) =>
    theme.components.semanticContainer.sizes.M.borderRadius};
  padding: ${({ theme }) => theme.components.semanticContainer.sizes.M.padding};
  height: 100%;
  overflow: auto;
`

const DatabaseAnalysisPage = () => {
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
    <MainContainer className={styles.main} data-testid="database-analysis-page">
      <Header
        items={reports}
        selectedValue={selectedAnalysis}
        onChangeSelectedAnalysis={handleSelectAnalysis}
        progress={data?.progress}
        analysisLoading={analysisLoading}
      />
      <DatabaseAnalysisTabs
        loading={analysisLoading}
        reports={reports}
        data={data}
      />
    </MainContainer>
  )
}

export default DatabaseAnalysisPage
