import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'

import { EndpointCell } from './components/EndpointCell/EndpointCell'

export const endpointResultColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Endpoint',
    id: 'publicEndpoint',
    accessorKey: 'publicEndpoint',
    enableSorting: true,
    minSize: 250,
    maxSize: 310,
    cell: ({
      row: {
        original: { publicEndpoint },
      },
    }) => <EndpointCell publicEndpoint={publicEndpoint} />,
  }
}
