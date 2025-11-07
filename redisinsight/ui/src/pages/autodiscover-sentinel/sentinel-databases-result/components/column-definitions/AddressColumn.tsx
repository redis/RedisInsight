import React from 'react'
import {
  CopyTextContainer,
  CopyPublicEndpointText,
  CopyBtn,
} from 'uiSrc/components/auto-discover'
import { RiTooltip } from 'uiSrc/components'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'

const handleCopy = (text = '') => {
  navigator.clipboard.writeText(text)
}

export const AddressColumn = (): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: 'Address',
    id: 'host',
    accessorKey: 'host',
    enableSorting: true,
    cell: ({
      row: {
        original: { host, port },
      },
    }) => {
      const text = `${host}:${port}`
      return (
        <CopyTextContainer>
          <CopyPublicEndpointText className="copyHostPortText">
            {text}
          </CopyPublicEndpointText>
          <RiTooltip
            position="right"
            content="Copy"
            anchorClassName="copyPublicEndpointTooltip"
          >
            <CopyBtn
              aria-label="Copy address"
              className="copyPublicEndpointBtn"
              onClick={() => handleCopy(text)}
              tabIndex={-1}
            />
          </RiTooltip>
        </CopyTextContainer>
      )
    },
  }
}
