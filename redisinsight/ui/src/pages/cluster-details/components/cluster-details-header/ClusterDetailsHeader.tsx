import React from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'

import { useTranslation } from 'uiSrc/i18n'
import { LoadingContent } from 'uiSrc/components/base/layout'
import {
  truncateNumberToFirstUnit,
  formatLongName,
  truncateNumberToDuration,
} from 'uiSrc/utils'
import { nullableNumberWithSpaces } from 'uiSrc/utils/numbers'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  ConnectionType,
  CONNECTION_TYPE_DISPLAY,
} from 'uiSrc/slices/interfaces'
import { clusterDetailsSelector } from 'uiSrc/slices/analytics/clusterDetails'
import { Text } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components'
import { AnalyticsPageHeader } from 'uiSrc/pages/database-analysis/components/analytics-page-header'

import {
  Container,
  Content,
  Item,
  Loading,
} from './ClusterDetailsHeader.styles'

interface IMetrics {
  id: string
  label: string
  value: any
  border?: 'left'
}

const MAX_NAME_LENGTH = 30

const ClusterDetailsHeader = () => {
  const { t } = useTranslation()
  const { username, connectionType = ConnectionType.Cluster } = useAppSelector(
    connectedInstanceSelector,
  )

  const { data, loading } = useAppSelector(clusterDetailsSelector)

  const defaultUsername = t('analytics.clusterDetails.header.defaultUsername')

  const metrics: IMetrics[] = [
    {
      id: 'Type',
      label: t('analytics.clusterDetails.header.type'),
      value: CONNECTION_TYPE_DISPLAY[connectionType],
    },
    {
      id: 'Version',
      label: t('analytics.clusterDetails.header.version'),
      value: data?.version || '',
    },
    {
      id: 'User',
      label: t('analytics.clusterDetails.header.user'),
      value:
        (username || defaultUsername)?.length < MAX_NAME_LENGTH ? (
          username || defaultUsername
        ) : (
          <RiTooltip
            anchorClassName="truncateText"
            position="bottom"
            content={<>{formatLongName(username || defaultUsername)}</>}
          >
            <div data-testid="cluster-details-username">
              {formatLongName(username || defaultUsername, MAX_NAME_LENGTH, 5)}
            </div>
          </RiTooltip>
        ),
    },
    {
      id: 'Uptime',
      label: t('analytics.clusterDetails.header.uptime'),
      border: 'left',
      value: (
        <RiTooltip
          position="top"
          content={
            <>
              {/* seconds suffix kept literal to match the untranslated
                  duration from truncateNumberToDuration below */}
              {`${nullableNumberWithSpaces(data?.uptimeSec) || 0} s`}
              <br />
              {`(${truncateNumberToDuration(data?.uptimeSec || 0)})`}
            </>
          }
        >
          <div data-testid="cluster-details-uptime">
            {truncateNumberToFirstUnit(data?.uptimeSec || 0)}
          </div>
        </RiTooltip>
      ),
    },
  ]

  return (
    <Container data-testid="cluster-details-header">
      <AnalyticsPageHeader />
      {loading && !data && (
        <Loading as="div" data-testid="cluster-details-loading">
          <LoadingContent lines={2} />
        </Loading>
      )}
      {data && (
        <Content data-testid="cluster-details-content">
          {metrics.map(({ id, value, label, border }) => (
            <Item
              key={id}
              $borderLeft={border === 'left'}
              data-testid={`cluster-details-item-${id}`}
            >
              <Text color="subdued">{value}</Text>
              <Text>{label}</Text>
            </Item>
          ))}
        </Content>
      )}
    </Container>
  )
}

export default ClusterDetailsHeader
