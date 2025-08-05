import React, { useEffect } from 'react'
import cx from 'classnames'

import { useDispatch, useSelector } from 'react-redux'
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

import { RiIconButton } from 'uiSrc/components/base/forms'
import { LightBulbIcon } from 'uiSrc/components/base/icons'
import { RiTooltip } from 'uiSrc/components'
import styles from './styles.module.scss'

export interface Props {
  source?: string
}

const InsightsTrigger = (props: Props) => {
  const { source = 'overview' } = props
  const { openedPanel } = useSelector(sidePanelsSelector)
  const { tabSelected } = useSelector(insightsPanelSelector)
  const { isHighlighted } = useSelector(recommendationsSelector)
  const { provider } = useSelector(connectedInstanceSelector)

  const isInsightsOpen = openedPanel === SidePanels.Insights

  const dispatch = useDispatch()
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
    <div className={cx(styles.container, { [styles.isOpen]: isInsightsOpen })}>
      <RiTooltip
        title={isHighlighted && instanceId ? undefined : 'Insights'}
        content={
          isHighlighted && instanceId
            ? 'New tips are available'
            : 'Open interactive tutorials to learn more about Redis or Redis Stack capabilities, or use tips to improve your database.'
        }
      >
        <RiIconButton
          size="S"
          className={styles.btn}
          role="button"
          icon={LightBulbIcon}
          onClick={handleClickTrigger}
          data-testid="insights-trigger"
        >
          {isHighlighted && instanceId && (
            <span className={styles.highlighting} />
          )}
        </RiIconButton>
      </RiTooltip>
    </div>
  )
}

export default InsightsTrigger
