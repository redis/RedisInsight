import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { RedisCloudSubscription } from 'uiSrc/slices/interfaces'

import { SubscriptionCell } from './components/SubscriptionCell/SubscriptionCell'

export const subscriptionColumn = (): ColumnDef<RedisCloudSubscription> => {
  return {
    id: 'name',
    accessorKey: 'name',
    header: 'Subscription',
    enableSorting: true,
    cell: ({
      row: {
        original: { name },
      },
    }) => <SubscriptionCell name={name} />,
  }
}
