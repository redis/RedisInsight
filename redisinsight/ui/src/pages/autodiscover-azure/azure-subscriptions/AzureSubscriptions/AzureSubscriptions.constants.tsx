import React from 'react'
import { TFunction } from 'i18next'

import { type ColumnDef, Table } from 'uiSrc/components/base/layout/table'
import { AzureSubscription } from 'uiSrc/slices/interfaces'
import { Text } from 'uiSrc/components/base/text'
import { ColumnHeader } from 'uiSrc/components/column-header'
import { DescriptionsTooltip } from 'uiSrc/pages/autodiscover-azure/components'
import { getAzureSubscriptionStateDescriptions } from 'uiSrc/pages/autodiscover-azure/constants'

export const getAzureSubscriptionsColumns = (
  t: TFunction,
): ColumnDef<AzureSubscription>[] => [
  {
    id: 'row-selection',
    maxSize: 15,
    size: 15,
    isHeaderCustom: true,
    header: t('autodiscover.azure.column.number'),
    cell: ({ row }) => (
      <Table.RowSelectionButton
        row={row}
        data-testid={`row-selection-${row.id}`}
      />
    ),
  },
  {
    id: 'displayName',
    header: t('autodiscover.azure.column.subscriptionName'),
    accessorKey: 'displayName',
    enableSorting: true,
    cell: ({ getValue }) => <Text size="M">{getValue() as string}</Text>,
  },
  {
    id: 'subscriptionId',
    header: t('autodiscover.azure.column.subscriptionId'),
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
        label={t('autodiscover.azure.column.state')}
        tooltip={
          <DescriptionsTooltip
            descriptions={getAzureSubscriptionStateDescriptions(t)}
          />
        }
      />
    ),
    cell: ({ getValue }) => <Text size="M">{getValue() as string}</Text>,
  },
]
