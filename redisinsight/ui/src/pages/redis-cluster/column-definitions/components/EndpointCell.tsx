import React from 'react'
import { RiTooltip } from 'uiSrc/components'
import { formatLongName } from 'uiSrc/utils'
import {
  CopyPublicEndpointText,
  CopyTextContainer,
  CopyBtnWrapper,
} from 'uiSrc/components/auto-discover'

export interface EndpointCellProps {
  dnsName: string
  port: number
}

export const EndpointCell = ({ dnsName, port }: EndpointCellProps) => {
  if (!dnsName) {
    return null
  }
  const text = `${dnsName}:${port}`

  return (
    <CopyTextContainer>
      <RiTooltip
        position="bottom"
        title="Endpoint"
        content={formatLongName(text)}
      >
        <CopyPublicEndpointText>{text}</CopyPublicEndpointText>
      </RiTooltip>

      <CopyBtnWrapper
        copy={text}
        aria-label="Copy public endpoint"
        successLabel=""
      />
    </CopyTextContainer>
  )
}
