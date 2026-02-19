import React from 'react'

import { type ColumnDef, Table } from 'uiSrc/components/base/layout/table'
import { AzureRedisDatabase } from 'uiSrc/slices/interfaces'
import { Text } from 'uiSrc/components/base/text'
import { HeaderWithTooltip } from 'uiSrc/components/auto-discover'
import {
  AZURE_DATABASE_TYPE_DESCRIPTIONS,
  AZURE_PROVISIONING_STATE_DESCRIPTIONS,
} from 'uiSrc/pages/autodiscover-azure/constants'

export const MAX_DATABASES_SELECTION = 10

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
    accessorKey: 'type',
    enableSorting: true,
    isHeaderCustom: true,
    header: () => (
      <HeaderWithTooltip
        title="Type"
        descriptions={AZURE_DATABASE_TYPE_DESCRIPTIONS}
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
    header: 'Region',
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
      <HeaderWithTooltip
        title="Status"
        descriptions={AZURE_PROVISIONING_STATE_DESCRIPTIONS}
      />
    ),
    cell: ({ getValue }) => <Text size="M">{getValue() as string}</Text>,
  },
]
