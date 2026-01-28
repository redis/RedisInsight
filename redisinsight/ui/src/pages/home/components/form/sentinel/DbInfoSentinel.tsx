import React from 'react'
import { capitalize } from 'lodash'

import { ConnectionType } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'
import { SentinelMaster } from 'apiSrc/modules/redis-sentinel/models/sentinel-master'
import { CopyButton } from 'uiSrc/components/copy-button'

import { DbInfoGroup } from '../DbInfo.styles'
import { ListGroupItemLabelValue } from '../DbInfo'
import { DbInfoLabelValue } from '../types'
import { StyledCopyContainer } from 'uiSrc/pages/home/components/form/sentinel/DbInfoSentinel.styles'

export interface Props {
  host?: string
  port?: string
  connectionType?: ConnectionType
  nameFromProvider?: Nullable<string>
  sentinelMaster?: SentinelMaster
}

const DbInfoSentinel = (props: Props) => {
  const { connectionType, nameFromProvider, sentinelMaster, host, port } = props

  const dbInfo: DbInfoLabelValue[] = [
    {
      label: 'Connection Type:',
      value: capitalize(connectionType),
      dataTestId: 'connection-type',
    },
    {
      label: 'Primary Group Name:',
      value: sentinelMaster?.name,
      dataTestId: 'primary-group-name',
      hide: !sentinelMaster?.name,
    },
    {
      label: 'Database Name from Provider:',
      value: nameFromProvider,
      dataTestId: 'db-name-from-provider',
      hide: !nameFromProvider,
    },
    {
      label: 'Sentinel Host & Port:',
      value: `${host}:${port}`,
      dataTestId: 'host-and-port',
      additionalContent: (
        <StyledCopyContainer>
          <CopyButton copy={`${host}:${port}`} aria-label="Copy host:port" />
        </StyledCopyContainer>
      ),
      hide: !host || !port,
    },
  ]

  return (
    <DbInfoGroup flush maxWidth={false}>
      {dbInfo
        .filter((item) => !item.hide)
        .map((item) => (
          <ListGroupItemLabelValue
            key={item.label}
            label={item.label}
            value={item.value}
            dataTestId={item.dataTestId}
            additionalContent={item.additionalContent}
          />
        ))}
    </DbInfoGroup>
  )
}

export default DbInfoSentinel
