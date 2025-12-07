import React from 'react'

import {
  CellText,
  CopyPublicEndpointText,
  CopyTextContainer,
  CopyBtnWrapper,
} from 'uiSrc/components/auto-discover'
import { RiTooltip } from 'uiSrc/components'
import { formatLongName } from 'uiSrc/utils'

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

      <CopyBtnWrapper
        copy={publicEndpoint}
        aria-label="Copy public endpoint"
        successLabel=""
      />
    </CopyTextContainer>
  )
}
