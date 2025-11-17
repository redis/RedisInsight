import React from 'react'
import { RiTooltip } from 'uiSrc/components'
import { formatLongName, handleCopy } from 'uiSrc/utils'
import {
  CopyBtn,
  CopyPublicEndpointText,
  CopyTextContainer,
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
        delay={200}
        position="bottom"
        title="Endpoint"
        content={formatLongName(text)}
      >
        <CopyPublicEndpointText>{text}</CopyPublicEndpointText>
      </RiTooltip>

      <RiTooltip
        position="right"
        content="Copy"
        anchorClassName="copyPublicEndpointTooltip"
      >
        <CopyBtn
          aria-label="Copy public endpoint"
          onClick={() => handleCopy(text)}
        />
      </RiTooltip>
    </CopyTextContainer>
  )
}

