import React, { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Header } from 'uiSrc/components/side-panels/components'
import { InsightsPanelTabs } from 'uiSrc/slices/interfaces/insights'
import EnablementAreaWrapper from 'uiSrc/components/side-panels/panels/enablement-area'
import LiveTimeRecommendations from 'uiSrc/components/side-panels/panels/live-time-recommendations'
import {
  changeSelectedTab,
  insightsPanelSelector,
} from 'uiSrc/slices/panels/sidePanels'
import { OnboardingTour } from 'uiSrc/components'
import Tabs, { TabInfo } from 'uiSrc/components/base/layout/tabs'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import { recommendationsSelector } from 'uiSrc/slices/recommendations/recommendations'
import {
  sendEventTelemetry,
  TELEMETRY_EMPTY_VALUE,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import * as S from 'uiSrc/components/side-panels/SidePanels.styles'

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
        <Row>
          <Text size="L" color="primary">
            Insights
          </Text>
        </Row>
      </Header>
      <S.Body>
        <S.Tabs
          as={Tabs}
          tabs={tabs}
          value={tabSelected}
          onChange={handleTabChange}
          data-testid="insights-tabs"
        />
        {tabSelected === InsightsPanelTabs.Explore && <EnablementAreaWrapper />}
        {tabSelected === InsightsPanelTabs.Recommendations && (
          <LiveTimeRecommendations />
        )}
      </S.Body>
    </>
  )
}

export default InsightsPanel
