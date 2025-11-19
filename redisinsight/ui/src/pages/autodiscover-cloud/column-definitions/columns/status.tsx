import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import {
  type RedisCloudSubscription,
  RedisCloudSubscriptionStatusText,
} from 'uiSrc/slices/interfaces'

import { CellText } from 'uiSrc/components/auto-discover'
import { AutoDiscoverCloudIds } from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const statusColumn = (): ColumnDef<RedisCloudSubscription> => {
  return {
    id: AutoDiscoverCloudIds.Status,
    accessorKey: AutoDiscoverCloudIds.Status,
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
