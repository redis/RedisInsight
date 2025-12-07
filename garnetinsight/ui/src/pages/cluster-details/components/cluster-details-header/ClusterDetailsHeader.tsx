import React from 'react'
import { useSelector } from 'react-redux'

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
  label: string
  value: any
  border?: 'left'
}

const MAX_NAME_LENGTH = 30
const DEFAULT_USERNAME = 'Default'

const ClusterDetailsHeader = () => {
  const {
    username = DEFAULT_USERNAME,
    connectionType = ConnectionType.Cluster,
  } = useSelector(connectedInstanceSelector)

  const { data, loading } = useSelector(clusterDetailsSelector)

  const metrics: IMetrics[] = [
    {
      label: 'Type',
      value: CONNECTION_TYPE_DISPLAY[connectionType],
    },
    {
      label: 'Version',
      value: data?.version || '',
    },
    {
      label: 'User',
      value:
        (username || DEFAULT_USERNAME)?.length < MAX_NAME_LENGTH ? (
          username || DEFAULT_USERNAME
        ) : (
          <RiTooltip
            anchorClassName="truncateText"
            position="bottom"
            content={<>{formatLongName(username || DEFAULT_USERNAME)}</>}
          >
            <div data-testid="cluster-details-username">
              {formatLongName(username || DEFAULT_USERNAME, MAX_NAME_LENGTH, 5)}
            </div>
          </RiTooltip>
        ),
    },
    {
      label: 'Uptime',
      border: 'left',
      value: (
        <RiTooltip
          position="top"
          content={
            <>
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
          {metrics.map(({ value, label, border }) => (
            <Item
              key={label}
              $borderLeft={border === 'left'}
              data-testid={`cluster-details-item-${label}`}
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
