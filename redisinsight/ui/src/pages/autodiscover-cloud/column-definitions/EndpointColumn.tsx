import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'

import { EndpointCell } from './components/EndpointCell/EndpointCell'

export const ENDPOINT_COLUMN_ID = 'publicEndpoint' as const

export const endpointColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Endpoint',
    id: ENDPOINT_COLUMN_ID,
    accessorKey: ENDPOINT_COLUMN_ID,
    enableSorting: true,
    minSize: 200,
    cell: ({
      row: {
        original: { publicEndpoint },
      },
    }) => <EndpointCell publicEndpoint={publicEndpoint} />,
  }
}
