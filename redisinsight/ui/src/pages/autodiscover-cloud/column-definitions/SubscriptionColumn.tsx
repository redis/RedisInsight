import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { RedisCloudSubscription } from 'uiSrc/slices/interfaces'

import { SubscriptionCell } from './components/SubscriptionCell/SubscriptionCell'

export const SUBSCRIPTION_COLUMN_ID = 'name' as const

export const subscriptionColumn = (): ColumnDef<RedisCloudSubscription> => {
  return {
    id: SUBSCRIPTION_COLUMN_ID,
    accessorKey: SUBSCRIPTION_COLUMN_ID,
    header: 'Subscription',
    enableSorting: true,
    cell: ({
      row: {
        original: { name },
      },
    }) => <SubscriptionCell name={name} />,
  }
}
