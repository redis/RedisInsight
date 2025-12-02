import React from 'react'

import { CopyButton } from 'uiSrc/components/copy-button'

import { sendCopyTelemetry } from './methods/handlers'
import { IDatabaseListCell } from '../../DatabasesList.types'
import { HostPortContainer } from './DatabasesListCellHost.styles'
import { CellText } from 'uiSrc/components/auto-discover'

const DatabasesListCellHost: IDatabaseListCell = ({ row }) => {
  const instance = row.original
  const { host, port, id } = instance
  const text = `${host}:${port}`

  return (
    <HostPortContainer gap="m" data-testid="host-port">
      <CellText>{text}</CellText>
      <CopyButton
        copy={text}
        aria-label="Copy host:port"
        onCopy={() => sendCopyTelemetry(id)}
      />
    </HostPortContainer>
  )
}

export default DatabasesListCellHost
