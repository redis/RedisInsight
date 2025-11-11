import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import { CellText } from 'uiSrc/components/auto-discover'

export const SubscriptionIdColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Subscription ID',
    id: 'subscriptionId',
    accessorKey: 'subscriptionId',
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
