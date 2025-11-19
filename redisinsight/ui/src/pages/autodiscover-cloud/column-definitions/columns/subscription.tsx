import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type RedisCloudSubscription } from 'uiSrc/slices/interfaces'

import { SubscriptionCell } from '../components/SubscriptionCell/SubscriptionCell'
import { AutoDiscoverCloudIds } from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const subscriptionColumn = (): ColumnDef<RedisCloudSubscription> => {
  return {
    id: AutoDiscoverCloudIds.Name,
    accessorKey: AutoDiscoverCloudIds.Name,
    header: 'Subscription',
    enableSorting: true,
    cell: ({
      row: {
        original: { name },
      },
    }) => <SubscriptionCell name={name} />,
  }
}
