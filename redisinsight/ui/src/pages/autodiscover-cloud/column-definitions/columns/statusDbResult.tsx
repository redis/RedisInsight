import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCloud } from 'uiSrc/slices/interfaces'

import { CellText } from 'uiSrc/components/auto-discover'

export const STATUS_DB_RESULT_COLUMN_ID = 'status' as const

export const statusDbResultColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Status',
    id: STATUS_DB_RESULT_COLUMN_ID,
    accessorKey: STATUS_DB_RESULT_COLUMN_ID,
    enableSorting: true,
    size: 80,
    cell: ({
      row: {
        original: { status },
      },
    }) => <CellText className="column_status">{status}</CellText>,
  }
}
