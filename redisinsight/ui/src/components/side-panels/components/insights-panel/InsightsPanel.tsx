import React, { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import type { TabInfo } from 'uiBase/layout'
import  { RiTabs } from 'uiBase/layout'
import { Header } from 'uiSrc/components/side-panels/components'
import styles from 'uiSrc/components/side-panels/styles.module.scss'
import { InsightsPanelTabs } from 'uiSrc/slices/interfaces/insights'
import EnablementAreaWrapper from 'uiSrc/components/side-panels/panels/enablement-area'
import LiveTimeRecommendations from 'uiSrc/components/side-panels/panels/live-time-recommendations'
import {
  changeSelectedTab,
  insightsPanelSelector,
} from 'uiSrc/slices/panels/sidePanels'
import { OnboardingTour } from 'uiSrc/components'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import { recommendationsSelector } from 'uiSrc/slices/recommendations/recommendations'
import {
  sendEventTelemetry,
  TELEMETRY_EMPTY_VALUE,
  TelemetryEvent,
} from 'uiSrc/telemetry'

export interface Props {
  isFullScreen: boolean
  onToggleFullScreen: () => void
  onClose: () => void
}

const InsightsPanel = (props: Props) => {
  const { isFullScreen, onToggleFullScreen, onClose } = props
  const { tabSelected } = useSelector(insightsPanelSelector)
  const {
    data: { totalUnread },
  } = useSelector(recommendationsSelector)

  const dispatch = useDispatch()
  const { instanceId } = useParams<{ instanceId: string }>()

  const handleChangeTab = (name: InsightsPanelTabs) => {
    if (tabSelected === name) return

    dispatch(changeSelectedTab(name))

    sendEventTelemetry({
      event: TelemetryEvent.INSIGHTS_PANEL_TAB_CHANGED,
      eventData: {
        databaseId: instanceId || TELEMETRY_EMPTY_VALUE,
        prevTab: tabSelected,
        currentTab: name,
      },
    })
  }

  const tabs: TabInfo[] = useMemo(
    () => [
      {
        label: (
          <OnboardingTour
            options={ONBOARDING_FEATURES.EXPLORE_REDIS}
            anchorPosition={isFullScreen ? 'rightUp' : 'leftUp'}
            anchorWrapperClassName={styles.onboardingAnchorWrapper}
            fullSize
          >
            <span>Tutorials</span>
          </OnboardingTour>
        ),
        value: InsightsPanelTabs.Explore,
        content: null,
      },
      {
        label: <span>Tips {totalUnread ? ` (${totalUnread})` : ''}</span>,
        value: InsightsPanelTabs.Recommendations,
        content: null,
      },
    ],
    [tabSelected, totalUnread, isFullScreen],
  )

  const handleTabChange = (name: string) => {
    if (tabSelected === name) return
    handleChangeTab(name as InsightsPanelTabs)
  }

  return (
    <>
      <Header
        isFullScreen={isFullScreen}
        onToggleFullScreen={onToggleFullScreen}
        onClose={onClose}
        panelName="insights"
      >
        <div className={styles.titleWrapper}>
          <span className={styles.title}>Insights</span>
        </div>
      </Header>
      <div className={styles.body}>
        <RiTabs
          tabs={tabs}
          value={tabSelected}
          onChange={handleTabChange}
          className={styles.tabs}
          data-testid="insights-tabs"
        />
        {tabSelected === InsightsPanelTabs.Explore && <EnablementAreaWrapper />}
        {tabSelected === InsightsPanelTabs.Recommendations && (
          <LiveTimeRecommendations />
        )}
      </div>
    </>
  )
}

export default InsightsPanel
