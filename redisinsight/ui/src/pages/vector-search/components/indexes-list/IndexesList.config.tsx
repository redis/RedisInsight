import React from 'react'

import { ColumnDef } from 'uiSrc/components/base/layout/table'
import { Button } from 'uiSrc/components/base/forms/buttons'

import {
  IndexListRow,
  IndexesListColumn,
  GetColumnsOptions,
} from './IndexesList.types'
import { INDEXES_LIST_COLUMN_HEADERS } from './constants'
import { NameCell } from './components/NameCell'
import { PrefixCell } from './components/PrefixCell'
import { FieldTypesCell } from './components/FieldTypesCell'
import { NumericCell } from './components/NumericCell'

export const BASE_COLUMNS: ColumnDef<IndexListRow>[] = [
  {
    id: IndexesListColumn.Name,
    accessorKey: IndexesListColumn.Name,
    header: INDEXES_LIST_COLUMN_HEADERS[IndexesListColumn.Name],
    enableSorting: true,
    cell: NameCell,
    sortingFn: (rowA, rowB) =>
      rowA.original.name
        .toLowerCase()
        .localeCompare(rowB.original.name.toLowerCase()),
  },
  {
    id: IndexesListColumn.Prefix,
    accessorKey: 'prefixes',
    header: INDEXES_LIST_COLUMN_HEADERS[IndexesListColumn.Prefix],
    enableSorting: false,
    cell: PrefixCell,
  },
  {
    id: IndexesListColumn.FieldTypes,
    accessorKey: IndexesListColumn.FieldTypes,
    header: INDEXES_LIST_COLUMN_HEADERS[IndexesListColumn.FieldTypes],
    enableSorting: false,
    cell: FieldTypesCell,
  },
  {
    id: IndexesListColumn.Docs,
    accessorKey: 'numDocs',
    header: INDEXES_LIST_COLUMN_HEADERS[IndexesListColumn.Docs],
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
    accessorKey: 'numRecords',
    header: INDEXES_LIST_COLUMN_HEADERS[IndexesListColumn.Records],
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
    accessorKey: 'numTerms',
    header: INDEXES_LIST_COLUMN_HEADERS[IndexesListColumn.Terms],
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
    accessorKey: 'numFields',
    header: INDEXES_LIST_COLUMN_HEADERS[IndexesListColumn.Fields],
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

/**
 * Creates the Actions column with the Query button and placeholder for future actions.
 */
const createActionsColumn = (
  onQueryClick?: (indexName: string) => void,
): ColumnDef<IndexListRow> => ({
  id: IndexesListColumn.Actions,
  header: INDEXES_LIST_COLUMN_HEADERS[IndexesListColumn.Actions],
  enableSorting: false,
  size: 100,
  cell: ({ row }) => {
    const { id, name } = row.original

    const handleQueryClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      onQueryClick?.(name)
    }

    return (
      <div data-testid={`index-actions-${id}`}>
        <Button
          size="small"
          onClick={handleQueryClick}
          data-testid={`index-query-btn-${id}`}
        >
          Query
        </Button>
        {/* TODO[DA]: Add menu actions */}
      </div>
    )
  },
})

/**
 * Returns the column definitions for the IndexesList.
 */
export const getIndexesListColumns = ({
  onQueryClick,
}: GetColumnsOptions = {}): ColumnDef<IndexListRow>[] => [
  ...BASE_COLUMNS,
  createActionsColumn(onQueryClick),
]
