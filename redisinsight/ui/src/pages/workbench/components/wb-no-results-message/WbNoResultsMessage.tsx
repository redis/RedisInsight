import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  changeSelectedTab,
  changeSidePanel,
} from 'uiSrc/slices/panels/sidePanels'
import { InsightsPanelTabs, SidePanels } from 'uiSrc/slices/interfaces/insights'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import BulbImg from 'uiSrc/assets/img/workbench/bulb.svg'
import ArrowToGuidesIcon from 'uiSrc/assets/img/workbench/arrow-to-guides.svg?react'

import { RiFlexItem, RiRow, RiCard } from 'uiSrc/components/base/layout'
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import { RiPrimaryButton } from 'uiSrc/components/base/forms'
import { LightBulbIcon } from 'uiSrc/components/base/icons'
import { RiTitle, RiText } from 'uiSrc/components/base/text'

import styles from './styles.module.scss'

const WbNoResultsMessage = () => {
  const { provider } = useSelector(connectedInstanceSelector)

  const { instanceId } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()

  const handleOpenInsights = () => {
    dispatch(changeSelectedTab(InsightsPanelTabs.Explore))
    dispatch(changeSidePanel(SidePanels.Insights))

    sendEventTelemetry({
      event: TelemetryEvent.INSIGHTS_PANEL_OPENED,
      eventData: {
        databaseId: instanceId,
        provider,
        source: 'workbench',
      },
    })
  }

  return (
    <div className={styles.noResults} data-testid="wb_no-results">
      <RiText
        className={styles.noResultsTitle}
        data-testid="wb_no-results__title"
      >
        No results to display yet
      </RiText>
      <RiTitle style={{ marginTop: 12, fontSize: 28 }}>
        This is our advanced CLI
      </RiTitle>
      <RiTitle style={{ marginTop: 6, fontSize: 20, lineHeight: 1.2 }}>
        for Redis commands.
      </RiTitle>
      <RiSpacer />

      <RiCard className={styles.noResultsPanel}>
        <ArrowToGuidesIcon className={styles.arrowToGuides} />
        <RiRow gap="m" responsive style={{ padding: 18 }}>
          <RiFlexItem>
            <img
              className={styles.noResultsIcon}
              src={BulbImg}
              alt="no results"
              data-testid="wb_no-results__icon"
            />
          </RiFlexItem>
          <RiFlexItem grow>
            <RiText
              className={styles.noResultsText}
              data-testid="wb_no-results__summary"
            >
              Try Workbench with our interactive Tutorials to learn how Redis
              can solve your use cases.
            </RiText>
            <RiSpacer size="xl" />
            <div>
              <RiPrimaryButton
                icon={LightBulbIcon}
                onClick={() => handleOpenInsights()}
                className={styles.exploreBtn}
                data-testid="no-results-explore-btn"
              >
                Explore
              </RiPrimaryButton>
            </div>
            <RiSpacer size="s" />
            <RiText color="subdued" textAlign="left" size="xs">
              Or click the icon in the top right corner.
            </RiText>
          </RiFlexItem>
        </RiRow>
      </RiCard>
    </div>
  )
}

export default WbNoResultsMessage
