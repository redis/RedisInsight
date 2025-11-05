import React from 'react'

import { RiTooltip } from 'uiSrc/components'
import { Text } from 'uiSrc/components/base/text'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CopyIcon } from 'uiSrc/components/base/icons'

import { handleCopyToClipboard } from './methods/handlers'
import { IDatabaseListCell } from '../../DatabasesList.types'
import { HostPortContainer } from './DatabasesListCellHost.styles'

const DatabasesListCellHost: IDatabaseListCell = ({ row }) => {
  const instance = row.original
  const { host, port, id } = instance
  const text = `${host}:${port}`

  return (
    <HostPortContainer gap="m" data-testid="host-port">
      <Text className="copyHostPortText">{text}</Text>
      <RiTooltip position="right" content="Copy">
        <IconButton
          icon={CopyIcon}
          aria-label="Copy host:port"
          onClick={(e) => handleCopyToClipboard(e, text, id)}
        />
      </RiTooltip>
    </HostPortContainer>
  )
}

export default DatabasesListCellHost
