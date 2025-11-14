import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'

import { SubscriptionCell } from './components/SubscriptionCell/SubscriptionCell'

export const SUBSCRIPTION_DB_COLUMN_ID = 'subscriptionName' as const

export const subscriptionDbColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Subscription',
    id: SUBSCRIPTION_DB_COLUMN_ID,
    accessorKey: SUBSCRIPTION_DB_COLUMN_ID,
    enableSorting: true,
    minSize: 200,
    cell: ({
      row: {
        original: { subscriptionName: name },
      },
    }) => <SubscriptionCell name={name} />,
  }
}
