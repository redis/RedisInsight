import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import {
  type RedisCloudSubscription,
  RedisCloudSubscriptionTypeText,
} from 'uiSrc/slices/interfaces'

import { CellText } from 'uiSrc/components/auto-discover'

export const TYPE_COLUMN_ID = 'type' as const

export const typeColumn = (): ColumnDef<RedisCloudSubscription> => {
  return {
    id: TYPE_COLUMN_ID,
    accessorKey: TYPE_COLUMN_ID,
    header: 'Type',
    enableSorting: true,
    cell: ({
      row: {
        original: { type },
      },
    }) => <CellText>{RedisCloudSubscriptionTypeText[type] ?? '-'}</CellText>,
  }
}
