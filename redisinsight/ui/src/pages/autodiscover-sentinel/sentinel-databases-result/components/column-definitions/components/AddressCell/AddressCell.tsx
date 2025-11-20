import React from 'react'
import {
  CopyTextContainer,
  CopyPublicEndpointText,
  CopyBtn,
} from 'uiSrc/components/auto-discover'
import { RiTooltip } from 'uiSrc/components'
import { handleCopy } from 'uiSrc/utils'

import type { AddressCellRendererProps } from './AddressCell.types'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'

export const AddressCellRenderer = ({
  host = '',
  port = '',
}: AddressCellRendererProps) => {
  if (!host || !port) {
    return null
  }

  const text = `${host}:${port}`
  return (
    <CopyTextContainer>
      <CopyPublicEndpointText className="copyHostPortText">
        {text}
      </CopyPublicEndpointText>
      <RiTooltip
        position="right"
        content="Copy"
        anchorClassName="copyPublicEndpointTooltip"
      >
        <CopyBtn
          aria-label="Copy address"
          className="copyPublicEndpointBtn"
          onClick={() => handleCopy(text)}
          tabIndex={-1}
        />
      </RiTooltip>
    </CopyTextContainer>
  )
}

export const AddressCell = ({
  row,
}: CellContext<ModifiedSentinelMaster, unknown>) => {
  const { host, port } = row.original
  return <AddressCellRenderer host={host} port={port} />
}
