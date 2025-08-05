import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useHistory } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'
import { AnalyticsViewTab } from 'uiSrc/slices/interfaces/analytics'
import {
  analyticsSettingsSelector,
  setAnalyticsViewTab,
} from 'uiSrc/slices/analytics/settings'
import { ConnectionType } from 'uiSrc/slices/interfaces'

import {
  appFeatureOnboardingSelector,
  setOnboardNextStep,
} from 'uiSrc/slices/app/features'
import { renderOnboardingTourWithChild } from 'uiSrc/utils/onboarding'
import { OnboardingSteps } from 'uiSrc/constants/onboarding'
import { useConnectionType } from 'uiSrc/components/hooks/useConnectionType'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import { RiTabs, TabInfo } from 'uiSrc/components/base/layout'
import { Text } from 'uiSrc/components/base/text'

const AnalyticsTabs = () => {
  const { viewTab } = useSelector(analyticsSettingsSelector)
  const connectionType = useConnectionType()
  const { currentStep } = useSelector(appFeatureOnboardingSelector)
  const history = useHistory()

  const { instanceId } = useParams<{ instanceId: string }>()

  const dispatch = useDispatch()

  useEffect(() => {
    if (
      connectionType !== ConnectionType.Cluster &&
      currentStep === OnboardingSteps.AnalyticsOverview
    ) {
      dispatch(setOnboardNextStep())
    }
  }, [])

  const tabs: TabInfo[] = useMemo(() => {
    const visibleTabs: TabInfo[] = [
      {
        value: AnalyticsViewTab.DatabaseAnalysis,
        content: null,
        label: renderOnboardingTourWithChild(
          <Text>Database Analysis</Text>,
          {
            options: ONBOARDING_FEATURES?.ANALYTICS_DATABASE_ANALYSIS,
            anchorPosition: 'downLeft',
          },
          viewTab === AnalyticsViewTab.DatabaseAnalysis,
          AnalyticsViewTab.DatabaseAnalysis,
        ),
      },
      {
        value: AnalyticsViewTab.SlowLog,
        content: null,
        label: renderOnboardingTourWithChild(
          <Text>Slow Log</Text>,
          {
            options: ONBOARDING_FEATURES?.ANALYTICS_SLOW_LOG,
            anchorPosition: 'downLeft',
          },
          viewTab === AnalyticsViewTab.SlowLog,
          AnalyticsViewTab.SlowLog,
        ),
      },
    ]

    if (connectionType === ConnectionType.Cluster) {
      visibleTabs.unshift({
        value: AnalyticsViewTab.ClusterDetails,
        content: null,
        label: renderOnboardingTourWithChild(
          <Text>Overview</Text>,
          {
            options: ONBOARDING_FEATURES?.ANALYTICS_OVERVIEW,
            anchorPosition: 'downLeft',
          },
          viewTab === AnalyticsViewTab.ClusterDetails,
          AnalyticsViewTab.ClusterDetails,
        ),
      })
    }

    return visibleTabs
  }, [viewTab, connectionType])

  const handleTabChange = (id: string) => {
    if (viewTab === id) return

    if (id === AnalyticsViewTab.ClusterDetails) {
      history.push(Pages.clusterDetails(instanceId))
    }
    if (id === AnalyticsViewTab.SlowLog) {
      history.push(Pages.slowLog(instanceId))
    }
    if (id === AnalyticsViewTab.DatabaseAnalysis) {
      history.push(Pages.databaseAnalysis(instanceId))
    }
    dispatch(setAnalyticsViewTab(id as AnalyticsViewTab))
  }

  return (
    <RiTabs
      tabs={tabs}
      value={viewTab}
      onChange={handleTabChange}
      data-testid="analytics-tabs"
    />
  )
}

export default AnalyticsTabs
