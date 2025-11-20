import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCloud } from 'uiSrc/slices/interfaces'

import { SubscriptionCell } from '../components/SubscriptionCell/SubscriptionCell'
import {
  AutoDiscoverCloudIds,
  AutoDiscoverCloudTitles,
} from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const subscriptionDbColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: AutoDiscoverCloudTitles.Subscription,
    id: AutoDiscoverCloudIds.SubscriptionName,
    accessorKey: AutoDiscoverCloudIds.SubscriptionName,
    enableSorting: true,
    minSize: 200,
    cell: ({
      row: {
        original: { subscriptionName: name },
      },
    }) => <SubscriptionCell name={name} />,
  }
}
