import React from 'react'
import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'

import { AddressCell } from '../components'

export const addressColumn = (): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: 'Address',
    id: 'host',
    accessorKey: 'host',
    enableSorting: true,
    cell: ({
      row: {
        original: { host, port },
      },
    }) => <AddressCell host={host} port={port} />,
  }
}
