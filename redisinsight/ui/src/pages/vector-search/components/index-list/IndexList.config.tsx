import React from 'react'

import { ColumnDef, Row } from 'uiSrc/components/base/layout/table'

import {
  IndexListRow,
  IndexListColumn,
  IndexListAction,
} from './IndexList.types'
import {
  INDEX_LIST_COLUMN_HEADERS,
  INDEX_LIST_COLUMN_TOOLTIPS,
} from './constants'
import { NameCell } from './components/NameCell/NameCell'
import { PrefixCell } from './components/PrefixCell/PrefixCell'
import { FieldTypesCell } from './components/FieldTypesCell/FieldTypesCell'
import { NumericCell } from './components/NumericCell/NumericCell'
import { ActionsCell } from './components/ActionsCell/ActionsCell'
import { ColumnHeader } from './components/ColumnHeader/ColumnHeader'

const createActionsColumn = (
  onQueryClick?: (indexName: string) => void,
  actions?: IndexListAction[],
): ColumnDef<IndexListRow> => ({
  id: IndexListColumn.Actions,
  header: INDEX_LIST_COLUMN_HEADERS[IndexListColumn.Actions],
  enableSorting: false,
  size: 110,
  sizeUnit: 'px',
  cell: ({ row }: { row: Row<IndexListRow> }) => (
    <ActionsCell
      row={row.original}
      onQueryClick={onQueryClick}
      actions={actions}
    />
  ),
})

const INDEX_LIST_COLUMNS_BASE: ColumnDef<IndexListRow>[] = [
  {
    id: IndexListColumn.Name,
    accessorKey: IndexListColumn.Name,
    header: INDEX_LIST_COLUMN_HEADERS[IndexListColumn.Name],
    enableSorting: true,
    size: 240,
    cell: ({ row }: { row: Row<IndexListRow> }) => (
      <NameCell row={row.original} />
    ),
    sortingFn: (rowA, rowB) =>
      rowA.original.name
        .toLowerCase()
        .localeCompare(rowB.original.name.toLowerCase()),
  },
  {
    id: IndexListColumn.Prefix,
    accessorKey: IndexListColumn.Prefix,
    header: () => (
      <ColumnHeader
        label={INDEX_LIST_COLUMN_HEADERS[IndexListColumn.Prefix]}
        tooltip={INDEX_LIST_COLUMN_TOOLTIPS[IndexListColumn.Prefix]}
      />
    ),
    enableSorting: false,
    cell: ({ row }: { row: Row<IndexListRow> }) => (
      <PrefixCell row={row.original} />
    ),
    size: 200,
  },
  {
    id: IndexListColumn.FieldTypes,
    accessorKey: IndexListColumn.FieldTypes,
    header: INDEX_LIST_COLUMN_HEADERS[IndexListColumn.FieldTypes],
    enableSorting: false,
    size: 220,
    cell: ({ row }: { row: Row<IndexListRow> }) => (
      <FieldTypesCell row={row.original} />
    ),
  },
  {
    id: IndexListColumn.Docs,
    accessorKey: IndexListColumn.Docs,
    header: () => (
      <ColumnHeader
        label={INDEX_LIST_COLUMN_HEADERS[IndexListColumn.Docs]}
        tooltip={INDEX_LIST_COLUMN_TOOLTIPS[IndexListColumn.Docs]}
      />
    ),
    enableSorting: true,
    size: 110,
    cell: ({ row }) => (
      <NumericCell
        value={row.original.numDocs}
        testId={`index-docs-${row.original.id}`}
      />
    ),
    sortingFn: (rowA, rowB) => rowA.original.numDocs - rowB.original.numDocs,
  },
  {
    id: IndexListColumn.Records,
    accessorKey: IndexListColumn.Records,
    header: () => (
      <ColumnHeader
        label={INDEX_LIST_COLUMN_HEADERS[IndexListColumn.Records]}
        tooltip={INDEX_LIST_COLUMN_TOOLTIPS[IndexListColumn.Records]}
      />
    ),
    enableSorting: true,
    size: 130,
    cell: ({ row }) => (
      <NumericCell
        value={row.original.numRecords}
        testId={`index-records-${row.original.id}`}
      />
    ),
    sortingFn: (rowA, rowB) =>
      rowA.original.numRecords - rowB.original.numRecords,
  },
  {
    id: IndexListColumn.Terms,
    accessorKey: IndexListColumn.Terms,
    header: () => (
      <ColumnHeader
        label={INDEX_LIST_COLUMN_HEADERS[IndexListColumn.Terms]}
        tooltip={INDEX_LIST_COLUMN_TOOLTIPS[IndexListColumn.Terms]}
      />
    ),
    enableSorting: true,
    size: 120,
    cell: ({ row }) => (
      <NumericCell
        value={row.original.numTerms}
        testId={`index-terms-${row.original.id}`}
      />
    ),
    sortingFn: (rowA, rowB) => rowA.original.numTerms - rowB.original.numTerms,
  },
  {
    id: IndexListColumn.Fields,
    accessorKey: IndexListColumn.Fields,
    header: () => (
      <ColumnHeader
        label={INDEX_LIST_COLUMN_HEADERS[IndexListColumn.Fields]}
        tooltip={INDEX_LIST_COLUMN_TOOLTIPS[IndexListColumn.Fields]}
      />
    ),
    enableSorting: true,
    size: 120,
    cell: ({ row }) => (
      <NumericCell
        value={row.original.numFields}
        testId={`index-fields-${row.original.id}`}
      />
    ),
    sortingFn: (rowA, rowB) =>
      rowA.original.numFields - rowB.original.numFields,
  },
]

export const getIndexListColumns = (options?: {
  onQueryClick?: (indexName: string) => void
  actions?: IndexListAction[]
}): ColumnDef<IndexListRow>[] => {
  const actions = options?.actions ?? []
  return [
    ...INDEX_LIST_COLUMNS_BASE,
    createActionsColumn(options?.onQueryClick, actions),
  ]
}
