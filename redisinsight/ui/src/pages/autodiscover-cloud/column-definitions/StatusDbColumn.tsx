import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import { StatusColumnText } from 'uiSrc/components/auto-discover'

export const statusDbColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Status',
    id: 'status',
    accessorKey: 'status',
    enableSorting: true,
    maxSize: 100,
    cell: ({
      row: {
        original: { status },
      },
    }) => <StatusColumnText>{status}</StatusColumnText>,
  }
}
