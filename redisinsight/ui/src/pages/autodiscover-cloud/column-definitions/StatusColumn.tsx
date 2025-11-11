import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import {
  RedisCloudSubscription,
  RedisCloudSubscriptionStatusText,
} from 'uiSrc/slices/interfaces'
import { CellText } from 'uiSrc/components/auto-discover'

export const StatusColumn = (): ColumnDef<RedisCloudSubscription> => {
  return {
    id: 'status',
    accessorKey: 'status',
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
