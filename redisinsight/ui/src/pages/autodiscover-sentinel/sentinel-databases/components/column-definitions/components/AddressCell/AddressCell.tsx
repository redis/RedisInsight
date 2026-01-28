import React from 'react'
import {
  CopyTextContainer,
  CopyPublicEndpointText,
  CopyBtnWrapper,
} from 'uiSrc/components/auto-discover'

import type { AddressCellProps } from './AddressCell.types'

export const AddressCell = ({ host, port }: AddressCellProps) => {
  if (!host || !port) {
    return null
  }

  const text = `${host}:${port}`
  return (
    <CopyTextContainer>
      <CopyPublicEndpointText>{text}</CopyPublicEndpointText>
      <CopyBtnWrapper
        copy={text}
        aria-label="Copy public endpoint"
        successLabel=""
      />
    </CopyTextContainer>
  )
}
