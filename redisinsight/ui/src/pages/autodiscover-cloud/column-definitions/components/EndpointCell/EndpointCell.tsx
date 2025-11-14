import React from 'react'

import {
  CopyBtn,
  CopyPublicEndpointText,
  CopyTextContainer,
} from 'uiSrc/components/auto-discover'
import { RiTooltip } from 'uiSrc/components'
import { formatLongName, handleCopy } from 'uiSrc/utils'

import { EndpointCellProps } from './EndpointCell.types'

export const EndpointCell = ({ publicEndpoint }: EndpointCellProps) => {
  return (
    <CopyTextContainer>
      <RiTooltip
        delay={200}
        position="bottom"
        title="Endpoint"
        content={formatLongName(publicEndpoint)}
      >
        <CopyPublicEndpointText>{publicEndpoint}</CopyPublicEndpointText>
      </RiTooltip>

      <RiTooltip
        delay={200}
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

