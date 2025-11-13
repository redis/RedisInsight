import React, { useMemo } from 'react'
import { isNull } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { EmptyMessage } from 'uiSrc/pages/database-analysis/constants'
import { EmptyAnalysisMessage } from 'uiSrc/pages/database-analysis/components'
import {
  setDatabaseAnalysisViewTab,
  dbAnalysisViewTabSelector,
} from 'uiSrc/slices/analytics/dbAnalysis'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { DatabaseAnalysisViewTab } from 'uiSrc/slices/interfaces/analytics'
import { Nullable } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { renderOnboardingTourWithChild } from 'uiSrc/utils/onboarding'
import { recommendationsSelector } from 'uiSrc/slices/recommendations/recommendations'
import Tabs, { TabInfo } from 'uiSrc/components/base/layout/tabs'
import { Text } from 'uiSrc/components/base/text'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import {
  ShortDatabaseAnalysis,
  DatabaseAnalysis,
} from 'apiSrc/modules/database-analysis/models'
import Recommendations from '../recommendations-view'
import AnalysisDataView from '../analysis-data-view'

import { EmptyMessageContainer } from './DatabaseAnalysisTabs.styles'

export interface Props {
  loading: boolean
  reports: ShortDatabaseAnalysis[]
  data: Nullable<DatabaseAnalysis>
}

const DatabaseAnalysisTabs = (props: Props) => {
  const { loading, reports, data } = props

  const viewTab = useSelector(dbAnalysisViewTabSelector)
  const { id: instanceId = '', provider } = useSelector(
    connectedInstanceSelector,
  )
  const { content: recommendationsContent } = useSelector(
    recommendationsSelector,
  )

  const dispatch = useDispatch()

  const tabs: TabInfo[] = useMemo(
    () => [
      {
        label: <Text>Data Summary</Text>,
        value: DatabaseAnalysisViewTab.DataSummary,
        content: <AnalysisDataView />,
      },
      {
        label: renderOnboardingTourWithChild(
          <Text>
            Tips{' '}
            {data?.recommendations?.length
              ? `(${data.recommendations.length})`
              : ''}
          </Text>,
          {
            options: { ...ONBOARDING_FEATURES.ANALYTICS_RECOMMENDATIONS },
            anchorPosition: 'downLeft',
          },
          viewTab === DatabaseAnalysisViewTab.Recommendations,
          'analytics-recommendations-tab',
        ),
        value: DatabaseAnalysisViewTab.Recommendations,
        content: <Recommendations />,
      },
    ],
    [viewTab, data?.recommendations],
  )

  const handleTabChange = (id: string) => {
    if (viewTab === id) return

    if (id === DatabaseAnalysisViewTab.DataSummary) {
      sendEventTelemetry({
        event: TelemetryEvent.DATABASE_ANALYSIS_DATA_SUMMARY_CLICKED,
        eventData: {
          databaseId: instanceId,
          provider,
        },
      })
    }
    if (id === DatabaseAnalysisViewTab.Recommendations) {
      sendEventTelemetry({
        event: TelemetryEvent.DATABASE_ANALYSIS_TIPS_CLICKED,
        eventData: {
          databaseId: instanceId,
          tipsCount: data?.recommendations?.length,
          list: data?.recommendations?.map(
            ({ name }) => recommendationsContent[name]?.telemetryEvent || name,
          ),
          provider,
        },
      })
    }
    dispatch(setDatabaseAnalysisViewTab(id as DatabaseAnalysisViewTab))
  }

  if (!loading && !reports?.length) {
    return (
      <EmptyMessageContainer data-testid="empty-reports-wrapper">
        <EmptyAnalysisMessage name={EmptyMessage.Reports} />
      </EmptyMessageContainer>
    )
  }
  if (!loading && !!reports?.length && isNull(data?.totalKeys)) {
    return (
      <EmptyMessageContainer data-testid="empty-encrypt-wrapper">
        <EmptyAnalysisMessage name={EmptyMessage.Encrypt} />
      </EmptyMessageContainer>
    )
  }

  return (
    <Tabs
      tabs={tabs}
      value={viewTab}
      onChange={handleTabChange}
      data-testid="database-analysis-tabs"
    />
  )
}

export default DatabaseAnalysisTabs
