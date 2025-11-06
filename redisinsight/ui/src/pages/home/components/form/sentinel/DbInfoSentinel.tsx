import React from 'react'
import { capitalize } from 'lodash'

import { ConnectionType } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'
import { SentinelMaster } from 'apiSrc/modules/redis-sentinel/models/sentinel-master'

import { RiTooltip } from 'uiSrc/components/base/tooltip'
import { CopyIcon } from 'uiSrc/components/base/icons'

import { DbInfoGroup } from '../DbInfo.styles'
import { ListGroupItemLabelValue } from '../DbInfo'
import { StyledCopyButton } from './DbInfoSentinel.styles'
import { DbInfoLabelValue } from '../types'

export interface Props {
  host?: string
  port?: string
  connectionType?: ConnectionType
  nameFromProvider?: Nullable<string>
  sentinelMaster?: SentinelMaster
}

const handleCopy = (text = '') => {
  navigator.clipboard.writeText(text)
}

const CopyButtonTooltip = ({
  host,
  port,
}: {
  host?: string
  port?: string
}) => (
  <RiTooltip position="right" content="Copy">
    <StyledCopyButton
      icon={CopyIcon}
      aria-label="Copy host:port"
      onClick={() => handleCopy(`${host}:${port}`)}
    />
  </RiTooltip>
)

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
      additionalContent: <CopyButtonTooltip host={host} port={port} />,
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
