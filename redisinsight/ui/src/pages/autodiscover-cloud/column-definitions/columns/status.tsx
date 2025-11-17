import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import {
  type RedisCloudSubscription,
  RedisCloudSubscriptionStatusText,
} from 'uiSrc/slices/interfaces'

import { CellText } from 'uiSrc/components/auto-discover'

export const STATUS_COLUMN_ID = 'status' as const

export const statusColumn = (): ColumnDef<RedisCloudSubscription> => {
  return {
    id: STATUS_COLUMN_ID,
    accessorKey: STATUS_COLUMN_ID,
    header: 'Status',
    enableSorting: true,
    cell: ({
      row: {
        original: { status },
      },
    }) => (
      <CellText>{RedisCloudSubscriptionStatusText[status] ?? '-'}</CellText>
    ),
  }
}
/*
    {
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
 */
