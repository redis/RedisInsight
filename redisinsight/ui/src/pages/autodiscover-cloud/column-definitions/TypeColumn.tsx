import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import {
  RedisCloudSubscription,
  RedisCloudSubscriptionTypeText,
} from 'uiSrc/slices/interfaces'
import { CellText } from 'uiSrc/components/auto-discover'

export const typeColumn = (): ColumnDef<RedisCloudSubscription> => {
  return {
    id: 'type',
    accessorKey: 'type',
    header: 'Type',
    enableSorting: true,
    cell: ({
      row: {
        original: { type },
      },
    }) => <CellText>{RedisCloudSubscriptionTypeText[type] ?? '-'}</CellText>,
  }
}
