import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import {
  CopyBtn,
  CopyPublicEndpointText,
  CopyTextContainer,
} from 'uiSrc/components/auto-discover'
import { RiTooltip } from 'uiSrc/components'
import { formatLongName, handleCopy } from 'uiSrc/utils'

export const endpointResultColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Endpoint',
    id: 'publicEndpoint',
    accessorKey: 'publicEndpoint',
    enableSorting: true,
    minSize: 250,
    maxSize: 310,
    cell: function PublicEndpoint({
      row: {
        original: { publicEndpoint },
      },
    }) {
      const text = publicEndpoint
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
    },
  }
}
