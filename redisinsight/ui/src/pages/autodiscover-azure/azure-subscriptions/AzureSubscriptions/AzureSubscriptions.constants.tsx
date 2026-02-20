import React from 'react'

import { type ColumnDef, Table } from 'uiSrc/components/base/layout/table'
import { AzureSubscription } from 'uiSrc/slices/interfaces'
import { Text } from 'uiSrc/components/base/text'
import { ColumnHeader } from 'uiSrc/components/column-header'
import { DescriptionsTooltip } from 'uiSrc/pages/autodiscover-azure/components'
import { AZURE_SUBSCRIPTION_STATE_DESCRIPTIONS } from 'uiSrc/pages/autodiscover-azure/constants'

export const AZURE_SUBSCRIPTIONS_COLUMNS: ColumnDef<AzureSubscription>[] = [
  {
    id: 'row-selection',
    maxSize: 15,
    size: 15,
    isHeaderCustom: true,
    header: '#',
    cell: ({ row }) => (
      <Table.RowSelectionButton
        row={row}
        data-testid={`row-selection-${row.id}`}
      />
    ),
  },
  {
    id: 'displayName',
    header: 'Subscription Name',
    accessorKey: 'displayName',
    enableSorting: true,
    cell: ({ getValue }) => <Text size="M">{getValue() as string}</Text>,
  },
  {
    id: 'subscriptionId',
    header: 'Subscription ID',
    accessorKey: 'subscriptionId',
    enableSorting: true,
    cell: ({ getValue }) => <Text size="M">{getValue() as string}</Text>,
  },
  {
    id: 'state',
    accessorKey: 'state',
    enableSorting: true,
    isHeaderCustom: true,
    header: () => (
      <ColumnHeader
        label="State"
        tooltip={
          <DescriptionsTooltip
            descriptions={AZURE_SUBSCRIPTION_STATE_DESCRIPTIONS}
          />
        }
      />
    ),
    cell: ({ getValue }) => <Text size="M">{getValue() as string}</Text>,
  },
]
