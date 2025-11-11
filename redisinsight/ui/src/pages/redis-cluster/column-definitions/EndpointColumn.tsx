import React from 'react'
import { RiTooltip } from 'uiSrc/components'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCluster } from 'uiSrc/slices/interfaces'
import { handleCopy } from 'uiSrc/utils'
import { Text } from 'uiSrc/components/base/text'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CopyIcon } from 'uiSrc/components/base/icons'

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
          <div className="host_port">
            <Text className="copyHostPortText">{text}</Text>
            <RiTooltip
              position="right"
              content="Copy"
              anchorClassName="copyHostPortTooltip"
            >
              <IconButton
                icon={CopyIcon}
                aria-label="Copy host:port"
                className="copyHostPortBtn"
                onClick={() => handleCopy(text)}
              />
            </RiTooltip>
          </div>
        )
      )
    },
  }
}
