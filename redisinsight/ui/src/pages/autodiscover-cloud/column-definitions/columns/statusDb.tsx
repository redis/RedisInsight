import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCloud } from 'uiSrc/slices/interfaces'

import { StatusColumnText } from 'uiSrc/components/auto-discover'

export const STATUS_DB_COLUMN_ID = 'status' as const

export const statusDbColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Status',
    id: STATUS_DB_COLUMN_ID,
    accessorKey: STATUS_DB_COLUMN_ID,
    enableSorting: true,
    maxSize: 100,
    cell: ({
      row: {
        original: { status },
      },
    }) => <StatusColumnText>{status}</StatusColumnText>,
  }
}
