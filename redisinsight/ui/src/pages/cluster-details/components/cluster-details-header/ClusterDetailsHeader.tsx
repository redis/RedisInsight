import React from 'react'
import { useSelector } from 'react-redux'
import cx from 'classnames'
import { capitalize } from 'lodash'

import { RiLoadingContent } from 'uiSrc/components/base/layout'
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
import AnalyticsTabs from 'uiSrc/components/analytics-tabs'
import { clusterDetailsSelector } from 'uiSrc/slices/analytics/clusterDetails'
import { RiText } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components'

import styles from './styles.module.scss'

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
            className={styles.tooltip}
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
          className={styles.tooltip}
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
    <div className={styles.container} data-testid="cluster-details-header">
      <AnalyticsTabs />

      {loading && !data && (
        <div className={styles.loading} data-testid="cluster-details-loading">
          <RiLoadingContent lines={2} />
        </div>
      )}
      {data && (
        <div
          className={cx(styles.content)}
          data-testid="cluster-details-content"
        >
          {metrics.map(({ value, label, border }) => (
            <div
              className={cx(styles.item, styles[`border${capitalize(border)}`])}
              key={label}
              data-testid={`cluster-details-item-${label}`}
            >
              <RiText color="subdued" className={styles.value}>
                {value}
              </RiText>
              <RiText className={styles.label}>{label}</RiText>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ClusterDetailsHeader
