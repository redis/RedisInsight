import React from 'react'
import {
  CopyTextContainer,
  CopyPublicEndpointText,
  CopyBtn,
} from 'uiSrc/components/auto-discover'
import { RiTooltip } from 'uiSrc/components'
import { handleCopy } from 'uiSrc/utils'

import type { AddressCellProps } from './AddressCell.types'

export const AddressCell = ({ host, port }: AddressCellProps) => {
  if (!host || !port) {
    return null
  }

  const text = `${host}:${port}`
  return (
    <CopyTextContainer>
      <CopyPublicEndpointText>{text}</CopyPublicEndpointText>
      <RiTooltip
        position="right"
        content="Copy"
        anchorClassName="copyPublicEndpointTooltip"
      >
        <CopyBtn
          aria-label="Copy public endpoint"
          onClick={() => handleCopy(text)}
          tabIndex={-1}
        />
      </RiTooltip>
    </CopyTextContainer>
  )
}
