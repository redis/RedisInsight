import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import {
  InstanceRedisCloud,
  RedisCloudSubscriptionTypeText,
} from 'uiSrc/slices/interfaces'
import { CellText } from 'uiSrc/components/auto-discover'

export const subscriptionTypeColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Type',
    id: 'subscriptionType',
    accessorKey: 'subscriptionType',
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
