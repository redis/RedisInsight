import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import {
  type InstanceRedisCloud,
  RedisCloudSubscriptionTypeText,
} from 'uiSrc/slices/interfaces'

import { CellText } from 'uiSrc/components/auto-discover'

export const SUBSCRIPTION_TYPE_COLUMN_ID = 'subscriptionType' as const

export const subscriptionTypeColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Type',
    id: SUBSCRIPTION_TYPE_COLUMN_ID,
    accessorKey: SUBSCRIPTION_TYPE_COLUMN_ID,
    enableSorting: true,
    maxSize: 100,
    cell: ({
      row: {
        original: { subscriptionType },
      },
    }) => (
      <CellText>
        {RedisCloudSubscriptionTypeText[subscriptionType!] ?? '-'}
      </CellText>
    ),
  }
}
