import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import { CellText } from 'uiSrc/components/auto-discover'
import { AutoDiscoverCloudIds } from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const subscriptionIdColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Subscription ID',
    id: AutoDiscoverCloudIds.SubscriptionId,
    accessorKey: AutoDiscoverCloudIds.SubscriptionId,
    enableSorting: true,
    maxSize: 120,
    cell: ({
      row: {
        original: { subscriptionId },
      },
    }) => (
      <CellText data-testid={`sub_id_${subscriptionId}`}>
        {subscriptionId}
      </CellText>
    ),
  }
}
