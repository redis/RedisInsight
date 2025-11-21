import React from 'react'

import {
  CellText,
  CopyBtn,
  CopyPublicEndpointText,
  CopyTextContainer,
} from 'uiSrc/components/auto-discover'
import { RiTooltip } from 'uiSrc/components'
import { formatLongName, handleCopy } from 'uiSrc/utils'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'

import type { EndpointCellRendererProps } from './EndpointCell.types'

export const EndpointCellRenderer = ({
  publicEndpoint,
}: EndpointCellRendererProps) => {
  if (!publicEndpoint) {
    return <CellText>-</CellText>
  }

  return (
    <CopyTextContainer>
      <RiTooltip
        position="bottom"
        title="Endpoint"
        content={formatLongName(publicEndpoint)}
      >
        <CopyPublicEndpointText>{publicEndpoint}</CopyPublicEndpointText>
      </RiTooltip>

      <RiTooltip
        position="right"
        content="Copy"
        anchorClassName="copyPublicEndpointTooltip"
      >
        <CopyBtn
          aria-label="Copy public endpoint"
          onClick={() => handleCopy(publicEndpoint)}
        />
      </RiTooltip>
    </CopyTextContainer>
  )
}

export const EndpointCell = ({
  row,
}: CellContext<InstanceRedisCloud, unknown>) => {
  const { publicEndpoint } = row.original
  return <EndpointCellRenderer publicEndpoint={publicEndpoint} />
}
