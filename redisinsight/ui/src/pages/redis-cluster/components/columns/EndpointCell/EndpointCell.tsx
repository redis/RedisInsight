import React from 'react'
import { RiTooltip } from 'uiSrc/components'
import { formatLongName, handleCopy } from 'uiSrc/utils'
import {
  CopyBtn,
  CopyPublicEndpointText,
  CopyTextContainer,
} from 'uiSrc/components/auto-discover'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCluster } from 'uiSrc/slices/interfaces'

export const EndpointCell = ({ row }: CellContext<InstanceRedisCluster, unknown>) => {
  const { dnsName, port } = row.original
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

