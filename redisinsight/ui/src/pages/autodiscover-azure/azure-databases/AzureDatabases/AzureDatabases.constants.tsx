import React from 'react'
import { TFunction } from 'i18next'

import { type ColumnDef, Table } from 'uiSrc/components/base/layout/table'
import { AzureRedisDatabase } from 'uiSrc/slices/interfaces'
import { Text } from 'uiSrc/components/base/text'
import { ColumnHeader } from 'uiSrc/components/column-header'
import { DescriptionsTooltip } from 'uiSrc/pages/autodiscover-azure/components'
import {
  getAzureDatabaseTypeDescriptions,
  getAzureProvisioningStateDescriptions,
} from 'uiSrc/pages/autodiscover-azure/constants'

export const MAX_DATABASES_SELECTION = 10

export const getAzureDatabasesColumns = (
  t: TFunction,
): ColumnDef<AzureRedisDatabase>[] => [
  {
    id: 'row-selection',
    maxSize: 20,
    size: 20,
    isHeaderCustom: true,
    header: ({ table }) => (
      <Table.HeaderMultiRowSelectionButton
        table={table}
        managePage
        data-testid="row-selection"
      />
    ),
    cell: ({ row }) => (
      <Table.RowSelectionButton
        row={row}
        data-testid={`row-selection-${row.id}`}
      />
    ),
  },
  {
    id: 'name',
    header: t('autodiscover.azure.column.databaseName'),
    accessorKey: 'name',
    enableSorting: true,
    cell: ({ getValue }) => <Text size="M">{getValue() as string}</Text>,
  },
  {
    id: 'type',
    accessorKey: 'type',
    enableSorting: true,
    isHeaderCustom: true,
    header: () => (
      <ColumnHeader
        label={t('autodiscover.azure.column.type')}
        tooltip={
          <DescriptionsTooltip
            descriptions={getAzureDatabaseTypeDescriptions(t)}
          />
        }
      />
    ),
    cell: ({ getValue }) => (
      <Text size="M" style={{ textTransform: 'capitalize' }}>
        {getValue() as string}
      </Text>
    ),
  },
  {
    id: 'location',
    header: t('autodiscover.azure.column.region'),
    accessorKey: 'location',
    enableSorting: true,
    cell: ({ getValue }) => <Text size="M">{getValue() as string}</Text>,
  },
  {
    id: 'provisioningState',
    accessorKey: 'provisioningState',
    enableSorting: true,
    isHeaderCustom: true,
    header: () => (
      <ColumnHeader
        label={t('autodiscover.azure.column.status')}
        tooltip={
          <DescriptionsTooltip
            descriptions={getAzureProvisioningStateDescriptions(t)}
          />
        }
      />
    ),
    cell: ({ getValue }) => <Text size="M">{getValue() as string}</Text>,
  },
]
