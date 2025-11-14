import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import { CellText } from 'uiSrc/components/auto-discover'

export const statusDbResultColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Status',
    id: 'status',
    accessorKey: 'status',
    enableSorting: true,
    size: 80,
    cell: ({
      row: {
        original: { status },
      },
    }) => <CellText className="column_status">{status}</CellText>,
  }
}
