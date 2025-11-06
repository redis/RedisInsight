import React from 'react'
import { capitalize } from 'lodash'
import styled from 'styled-components'

import { ConnectionType } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'
import { SentinelMaster } from 'apiSrc/modules/redis-sentinel/models/sentinel-master'

import { RiTooltip } from 'uiSrc/components/base/tooltip'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CopyIcon } from 'uiSrc/components/base/icons'

import { DbInfoGroup } from '../DbInfo.styles'
import { ListGroupItemLabelValue } from '../DbInfo'

export interface Props {
  host?: string
  port?: string
  connectionType?: ConnectionType
  nameFromProvider?: Nullable<string>
  sentinelMaster?: SentinelMaster
}

const StyledCopyButton = styled(IconButton)`
  margin-bottom: 3px;
  opacity: 0;

  :hover {
    opacity: 1;
  }
`

const DbInfoSentinel = (props: Props) => {
  const { connectionType, nameFromProvider, sentinelMaster, host, port } = props

  const handleCopy = (text = '') => {
    navigator.clipboard.writeText(text)
  }

  return (
    <DbInfoGroup flush maxWidth={false}>
      <ListGroupItemLabelValue
        label="Connection Type:"
        value={capitalize(connectionType)}
        dataTestId="connection-type"
      />

      {sentinelMaster?.name && (
        <ListGroupItemLabelValue
          label="Primary Group Name:"
          value={sentinelMaster?.name}
          dataTestId="primary-group-name"
        />
      )}

      {nameFromProvider && (
        <ListGroupItemLabelValue
          label="Database Name from Provider:"
          value={nameFromProvider}
          dataTestId="db-name-from-provider"
        />
      )}

      {host && port && (
        <ListGroupItemLabelValue
          label="Sentinel Host & Port:"
          value={`${host}:${port}`}
          dataTestId="host-and-port"
          additionalContent={
            <RiTooltip position="right" content="Copy">
              <StyledCopyButton
                icon={CopyIcon}
                aria-label="Copy host:port"
                onClick={() => handleCopy(`${host}:${port}`)}
              />
            </RiTooltip>
          }
        />
      )}
    </DbInfoGroup>
  )
}

export default DbInfoSentinel
