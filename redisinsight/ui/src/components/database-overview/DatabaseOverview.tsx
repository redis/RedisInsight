import React from 'react'
import { getConfig } from 'uiSrc/config'

import {
  DATABASE_OVERVIEW_MINIMUM_REFRESH_INTERVAL,
  DATABASE_OVERVIEW_REFRESH_INTERVAL,
} from 'uiSrc/constants/browser'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import MetricItem from 'uiSrc/components/database-overview/components/OverviewMetrics/MetricItem'
import { useDatabaseOverview } from 'uiSrc/components/database-overview/hooks/useDatabaseOverview'

import { IMetric } from 'uiSrc/components/database-overview/components/OverviewMetrics'
import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import * as S from './DatabaseOverview.styles'
import AutoRefresh from '../auto-refresh'

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
    handleRefresh,
  } = useDatabaseOverview()

  return (
    <S.Container>
      <S.ItemContainer centered gap="m" key="overview" className="overview">
        {connectivityError && (
          <MetricItem
            id="connectivityError"
            tooltipContent={connectivityError}
            content={<RiIcon size="m" type="ToastInfoIcon" color="danger500" />}
          />
        )}
        {metrics?.length! > 0 && (
          <>
            {subscriptionId && subscriptionType === 'fixed' && (
              <S.UpgradeBtnItem id="upgrade-ri-db-button">
                <S.UpgradeBtn>
                  <SecondaryButton
                    filled={!!usedMemoryPercent && usedMemoryPercent >= 75}
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
                </S.UpgradeBtn>
              </S.UpgradeBtnItem>
            )}
            {metrics?.map((overviewItem) => (
              <MetricItem
                key={overviewItem.id}
                {...overviewItem}
                tooltipContent={getTooltipContent(overviewItem)}
              />
            ))}
            <S.AutoRefresh
              data-testid="overview-auto-refresh"
              id="overview-auto-refresh"
            >
              <S.OverviewItemContent>
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
                  onEnableAutoRefresh={handleEnableAutoRefresh}
                />
              </S.OverviewItemContent>
            </S.AutoRefresh>
          </>
        )}
      </S.ItemContainer>
    </S.Container>
  )
}

const getTooltipContent = (metric: IMetric) => {
  if (!metric.children?.length) {
    return (
      <Row gap="m">
        <span>{metric.tooltip?.content}</span>
        <span>{metric.tooltip?.title}</span>
      </Row>
    )
  }
  return metric.children
    .filter((item) => item.value !== undefined)
    .map((tooltipItem) => (
      <S.CommandsPerSecTip key={tooltipItem.id}>
        <Row align="center">
          {tooltipItem.icon && (
            <FlexItem>
              <S.MoreInfoOverviewIcon>
                <RiIcon size="m" type={tooltipItem.icon} />
              </S.MoreInfoOverviewIcon>
            </FlexItem>
          )}
          <S.MoreInfoOverviewContent grow={false}>
            {tooltipItem.content}
          </S.MoreInfoOverviewContent>
          <S.MoreInfoOverviewTitle>{tooltipItem.title}</S.MoreInfoOverviewTitle>
        </Row>
      </S.CommandsPerSecTip>
    ))
}

export default DatabaseOverview
