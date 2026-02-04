import React from 'react'

import { type ColumnDef, Table } from 'uiSrc/components/base/layout/table'
import { AzureRedisDatabase } from 'uiSrc/slices/interfaces'
import { Text } from 'uiSrc/components/base/text'

export const AZURE_DATABASES_COLUMNS: ColumnDef<AzureRedisDatabase>[] = [
  {
    id: 'row-selection',
    maxSize: 20,
    size: 20,
    isHeaderCustom: true,
    header: ({ table }) => (
      <Table.HeaderMultiRowSelectionButton
        table={table}
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
    header: 'Database Name',
    accessorKey: 'name',
    enableSorting: true,
    cell: ({ getValue }) => <Text size="M">{getValue() as string}</Text>,
  },
  {
    id: 'type',
    header: 'Type',
    accessorKey: 'type',
    enableSorting: true,
    cell: ({ getValue }) => (
      <Text size="M" style={{ textTransform: 'capitalize' }}>
        {getValue() as string}
      </Text>
    ),
  },
  {
    id: 'location',
    header: 'Region',
    accessorKey: 'location',
    enableSorting: true,
    cell: ({ getValue }) => <Text size="M">{getValue() as string}</Text>,
  },
  {
    id: 'provisioningState',
    header: 'Status',
    accessorKey: 'provisioningState',
    enableSorting: true,
    cell: ({ getValue }) => <Text size="M">{getValue() as string}</Text>,
  },
]
