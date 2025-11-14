import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'

import { EndpointCell } from './components/EndpointCell/EndpointCell'

export const ENDPOINT_RESULT_COLUMN_ID = 'publicEndpoint' as const

export const endpointResultColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Endpoint',
    id: ENDPOINT_RESULT_COLUMN_ID,
    accessorKey: ENDPOINT_RESULT_COLUMN_ID,
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
