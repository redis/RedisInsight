import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCloud } from 'uiSrc/slices/interfaces'

import { SubscriptionCell } from '../components/SubscriptionCell/SubscriptionCell'
import { AutoDiscoverCloudIds } from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const subscriptionDbResultColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Subscription',
    id: AutoDiscoverCloudIds.SubscriptionName,
    accessorKey: AutoDiscoverCloudIds.SubscriptionName,
    enableSorting: true,
    maxSize: 270,
    cell: ({
      row: {
        original: { subscriptionName: name },
      },
    }) => <SubscriptionCell name={name} />,
  }
}
