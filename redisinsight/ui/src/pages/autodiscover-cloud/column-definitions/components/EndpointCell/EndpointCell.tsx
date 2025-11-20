import React from 'react'

import {
  CellText,
  CopyBtn,
  CopyPublicEndpointText,
  CopyTextContainer,
} from 'uiSrc/components/auto-discover'
import { RiTooltip } from 'uiSrc/components'
import { formatLongName, handleCopy } from 'uiSrc/utils'

import { EndpointCellProps } from './EndpointCell.types'

export const EndpointCell = ({ publicEndpoint }: EndpointCellProps) => {
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
