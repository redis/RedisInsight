import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'

import { SubscriptionCell } from './components/SubscriptionCell/SubscriptionCell'

export const subscriptionDbResultColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Subscription',
    id: 'subscriptionName',
    accessorKey: 'subscriptionName',
    enableSorting: true,
    maxSize: 270,
    cell: ({
      row: {
        original: { subscriptionName: name },
      },
    }) => <SubscriptionCell name={name} />,
  }
}
