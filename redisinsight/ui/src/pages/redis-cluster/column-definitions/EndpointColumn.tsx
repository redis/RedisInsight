import React from 'react'
import { RiTooltip } from 'uiSrc/components'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCluster } from 'uiSrc/slices/interfaces'
import { formatLongName, handleCopy } from 'uiSrc/utils'
import {
  CopyBtn,
  CopyPublicEndpointText,
  CopyTextContainer,
} from 'uiSrc/components/auto-discover'

export const EndpointColumn = (): ColumnDef<InstanceRedisCluster> => {
  return {
    header: 'Endpoint',
    id: 'dnsName',
    accessorKey: 'dnsName',
    enableSorting: true,
    cell: ({
      row: {
        original: { dnsName, port },
      },
    }) => {
      const text = `${dnsName}:${port}`
      return (
        !!dnsName && (
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
      )
    },
  }
}
