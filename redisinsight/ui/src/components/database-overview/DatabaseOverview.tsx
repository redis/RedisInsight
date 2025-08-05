import React from 'react'
import cx from 'classnames'
import { getConfig } from 'uiSrc/config'

import {
  DATABASE_OVERVIEW_MINIMUM_REFRESH_INTERVAL,
  DATABASE_OVERVIEW_REFRESH_INTERVAL,
} from 'uiSrc/constants/browser'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import MetricItem, {
  OverviewItem,
} from 'uiSrc/components/database-overview/components/OverviewMetrics/MetricItem'
import { useDatabaseOverview } from 'uiSrc/components/database-overview/hooks/useDatabaseOverview'

import { IMetric } from 'uiSrc/components/database-overview/components/OverviewMetrics'
import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { RiIcon } from 'uiSrc/components/base/icons'
import AutoRefresh from '../auto-refresh'
import styles from './styles.module.scss'

const riConfig = getConfig()

const DatabaseOverview = () => {
  const {
    connectivityError,
    metrics,
    subscriptionId,
    subscriptionType,
    usedMemoryPercent,
    isBdbPackages,
    lastRefreshTime,
    handleEnableAutoRefresh,
    handleRefreshClick,
    handleRefresh,
  } = useDatabaseOverview()

  return (
    <Row className={styles.container}>
      <FlexItem grow key="overview">
        <Row
          className={cx('flex-row', styles.itemContainer, styles.overview)}
          align="center"
        >
          {connectivityError && (
            <MetricItem
              id="connectivityError"
              tooltipContent={connectivityError}
              content={
                <RiIcon size="m" type="ToastInfoIcon" color="danger500" />
              }
            />
          )}
          {metrics?.length! > 0 && (
            <>
              {subscriptionId && subscriptionType === 'fixed' && (
                <OverviewItem
                  id="upgrade-ri-db-button"
                  className={styles.upgradeBtnItem}
                  style={{ borderRight: 'none' }}
                >
                  <SecondaryButton
                    filled={!!usedMemoryPercent && usedMemoryPercent >= 75}
                    className={cx(styles.upgradeBtn)}
                    style={{ fontWeight: '400' }}
                    onClick={() => {
                      const upgradeUrl = isBdbPackages
                        ? `${riConfig.app.returnUrlBase}/databases/upgrade/${subscriptionId}`
                        : `${riConfig.app.returnUrlBase}/subscription/${subscriptionId}/change-plan`
                      window.open(upgradeUrl, '_blank')
                    }}
                    data-testid="upgrade-ri-db-button"
                  >
                    Upgrade plan
                  </SecondaryButton>
                </OverviewItem>
              )}
              {metrics?.map((overviewItem) => (
                <MetricItem
                  key={overviewItem.id}
                  {...overviewItem}
                  tooltipContent={getTooltipContent(overviewItem)}
                />
              ))}
              <OverviewItem
                className={styles.autoRefresh}
                data-testid="overview-auto-refresh"
                id="overview-auto-refresh"
              >
                <FlexItem className={styles.overviewItemContent}>
                  <AutoRefresh
                    displayText={false}
                    displayLastRefresh={false}
                    iconSize="S"
                    loading={false}
                    enableAutoRefreshDefault
                    lastRefreshTime={lastRefreshTime}
                    containerClassName=""
                    postfix="overview"
                    testid="auto-refresh-overview"
                    defaultRefreshRate={DATABASE_OVERVIEW_REFRESH_INTERVAL}
                    minimumRefreshRate={parseInt(
                      DATABASE_OVERVIEW_MINIMUM_REFRESH_INTERVAL,
                    )}
                    onRefresh={handleRefresh}
                    onRefreshClicked={handleRefreshClick}
                    onEnableAutoRefresh={handleEnableAutoRefresh}
                  />
                </FlexItem>
              </OverviewItem>
            </>
          )}
        </Row>
      </FlexItem>
    </Row>
  )
}

const getTooltipContent = (metric: IMetric) => {
  if (!metric.children?.length) {
    return (
      <>
        <span>{metric.tooltip?.content}</span>
        &nbsp;
        <span>{metric.tooltip?.title}</span>
      </>
    )
  }
  return metric.children
    .filter((item) => item.value !== undefined)
    .map((tooltipItem) => (
      <Row
        className={styles.commandsPerSecTip}
        key={tooltipItem.id}
        align="center"
      >
        {tooltipItem.icon && (
          <FlexItem>
            <RiIcon
              className={styles.moreInfoOverviewIcon}
              size="m"
              type={tooltipItem.icon}
            />
          </FlexItem>
        )}
        <FlexItem className={styles.moreInfoOverviewContent} direction="row">
          {tooltipItem.content}
        </FlexItem>
        <FlexItem className={styles.moreInfoOverviewTitle}>
          {tooltipItem.title}
        </FlexItem>
      </Row>
    ))
}

export default DatabaseOverview
