import React from 'react'

import { ColumnDef, Row } from 'uiSrc/components/base/layout/table'

import {
  IndexListRow,
  IndexesListColumn,
  IndexListAction,
} from './IndexesList.types'
import {
  INDEXES_LIST_COLUMN_HEADERS,
  INDEXES_LIST_COLUMN_TOOLTIPS,
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
  id: IndexesListColumn.Actions,
  header: INDEXES_LIST_COLUMN_HEADERS[IndexesListColumn.Actions],
  enableSorting: false,
  size: 150,
  cell: ({ row }: { row: Row<IndexListRow> }) => (
    <ActionsCell
      row={row.original}
      onQueryClick={onQueryClick}
      actions={actions}
    />
  ),
})

const INDEXES_LIST_COLUMNS_BASE: ColumnDef<IndexListRow>[] = [
  {
    id: IndexesListColumn.Name,
    accessorKey: IndexesListColumn.Name,
    header: INDEXES_LIST_COLUMN_HEADERS[IndexesListColumn.Name],
    enableSorting: true,
    size: 200,
    cell: ({ row }: { row: Row<IndexListRow> }) => (
      <NameCell row={row.original} />
    ),
    sortingFn: (rowA, rowB) =>
      rowA.original.name
        .toLowerCase()
        .localeCompare(rowB.original.name.toLowerCase()),
  },
  {
    id: IndexesListColumn.Prefix,
    accessorKey: IndexesListColumn.Prefix,
    header: () => (
      <ColumnHeader
        label={INDEXES_LIST_COLUMN_HEADERS[IndexesListColumn.Prefix]}
        tooltip={INDEXES_LIST_COLUMN_TOOLTIPS[IndexesListColumn.Prefix]}
      />
    ),
    enableSorting: false,
    cell: ({ row }: { row: Row<IndexListRow> }) => (
      <PrefixCell row={row.original} />
    ),
    size: 170,
  },
  {
    id: IndexesListColumn.FieldTypes,
    accessorKey: IndexesListColumn.FieldTypes,
    header: INDEXES_LIST_COLUMN_HEADERS[IndexesListColumn.FieldTypes],
    enableSorting: false,
    size: 200,
    cell: ({ row }: { row: Row<IndexListRow> }) => (
      <FieldTypesCell row={row.original} />
    ),
  },
  {
    id: IndexesListColumn.Docs,
    accessorKey: IndexesListColumn.Docs,
    header: () => (
      <ColumnHeader
        label={INDEXES_LIST_COLUMN_HEADERS[IndexesListColumn.Docs]}
        tooltip={INDEXES_LIST_COLUMN_TOOLTIPS[IndexesListColumn.Docs]}
      />
    ),
    enableSorting: true,
    cell: ({ row }) => (
      <NumericCell
        value={row.original.numDocs}
        testId={`index-docs-${row.original.id}`}
      />
    ),
    sortingFn: (rowA, rowB) => rowA.original.numDocs - rowB.original.numDocs,
  },
  {
    id: IndexesListColumn.Records,
    accessorKey: IndexesListColumn.Records,
    header: () => (
      <ColumnHeader
        label={INDEXES_LIST_COLUMN_HEADERS[IndexesListColumn.Records]}
        tooltip={INDEXES_LIST_COLUMN_TOOLTIPS[IndexesListColumn.Records]}
      />
    ),
    enableSorting: true,
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
    id: IndexesListColumn.Terms,
    accessorKey: IndexesListColumn.Terms,
    header: () => (
      <ColumnHeader
        label={INDEXES_LIST_COLUMN_HEADERS[IndexesListColumn.Terms]}
        tooltip={INDEXES_LIST_COLUMN_TOOLTIPS[IndexesListColumn.Terms]}
      />
    ),
    enableSorting: true,
    cell: ({ row }) => (
      <NumericCell
        value={row.original.numTerms}
        testId={`index-terms-${row.original.id}`}
      />
    ),
    sortingFn: (rowA, rowB) => rowA.original.numTerms - rowB.original.numTerms,
  },
  {
    id: IndexesListColumn.Fields,
    accessorKey: IndexesListColumn.Fields,
    header: () => (
      <ColumnHeader
        label={INDEXES_LIST_COLUMN_HEADERS[IndexesListColumn.Fields]}
        tooltip={INDEXES_LIST_COLUMN_TOOLTIPS[IndexesListColumn.Fields]}
      />
    ),
    enableSorting: true,
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

export const getIndexesListColumns = (options?: {
  onQueryClick?: (indexName: string) => void
  actions?: IndexListAction[]
}): ColumnDef<IndexListRow>[] => {
  const actions = options?.actions ?? []
  return [
    ...INDEXES_LIST_COLUMNS_BASE,
    createActionsColumn(options?.onQueryClick, actions),
  ]
}
