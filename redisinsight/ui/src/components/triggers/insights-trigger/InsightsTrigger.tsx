import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import { useLocation, useParams } from 'react-router-dom'

import {
  changeSelectedTab,
  changeSidePanel,
  insightsPanelSelector,
  sidePanelsSelector,
  toggleSidePanel,
} from 'uiSrc/slices/panels/sidePanels'

import {
  recommendationsSelector,
  resetRecommendationsHighlighting,
} from 'uiSrc/slices/recommendations/recommendations'
import { InsightsPanelTabs, SidePanels } from 'uiSrc/slices/interfaces/insights'
import {
  sendEventTelemetry,
  TELEMETRY_EMPTY_VALUE,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'

import { LightBulbIcon } from 'uiSrc/components/base/icons'
import { RiTooltip } from 'uiSrc/components'
import { useTranslation } from 'uiSrc/i18n'

import {
  BulbHighlighting,
  BulbIconButton,
  BulbWrapper,
} from './InsightsTrigger.styles'

export interface Props {
  source?: string
}

const InsightsTrigger = (props: Props) => {
  const { source = 'overview' } = props
  const { t } = useTranslation()
  const { openedPanel } = useAppSelector(sidePanelsSelector)
  const { tabSelected } = useAppSelector(insightsPanelSelector)
  const { isHighlighted } = useAppSelector(recommendationsSelector)
  const { provider } = useAppSelector(connectedInstanceSelector)

  const isInsightsOpen = openedPanel === SidePanels.Insights

  const dispatch = useAppDispatch()
  const { pathname, search } = useLocation()
  const { instanceId } = useParams<{ instanceId: string }>()

  const page = pathname.replace(instanceId, '').replace(/^\//g, '')

  useEffect(() => {
    const searchParams = new URLSearchParams(search)
    const isExploreShouldBeOpened = searchParams.get('insights') === 'open'

    if (isExploreShouldBeOpened) {
      dispatch(changeSidePanel(SidePanels.Insights))
      dispatch(changeSelectedTab(InsightsPanelTabs.Explore))
    }
  }, [search])

  const handleClickTrigger = () => {
    if (isHighlighted) {
      dispatch(resetRecommendationsHighlighting())
      dispatch(changeSelectedTab(InsightsPanelTabs.Recommendations))
    }
    dispatch(toggleSidePanel(SidePanels.Insights))

    sendEventTelemetry({
      event: isInsightsOpen
        ? TelemetryEvent.INSIGHTS_PANEL_CLOSED
        : TelemetryEvent.INSIGHTS_PANEL_OPENED,
      eventData: {
        provider,
        page,
        source,
        databaseId: instanceId || TELEMETRY_EMPTY_VALUE,
        tab: isHighlighted ? InsightsPanelTabs.Recommendations : tabSelected,
      },
    })
  }

  return (
    <RiTooltip
      title={
        isHighlighted && instanceId ? undefined : t('insights.trigger.title')
      }
      content={
        isHighlighted && instanceId
          ? t('insights.trigger.newTips')
          : t('insights.trigger.description')
      }
    >
      <BulbWrapper>
        <BulbIconButton
          size="S"
          role="button"
          icon={LightBulbIcon}
          onClick={handleClickTrigger}
          data-testid="insights-trigger"
          isOpen={isInsightsOpen}
          aria-label={t('insights.trigger.ariaLabel')}
        />
        {isHighlighted && instanceId && <BulbHighlighting />}
      </BulbWrapper>
    </RiTooltip>
  )
}

export default InsightsTrigger
