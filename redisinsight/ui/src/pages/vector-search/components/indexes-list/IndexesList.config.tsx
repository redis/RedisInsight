import React from 'react'

import { ColumnDef } from 'uiSrc/components/base/layout/table'

import { IndexListRow, IndexesListColumn } from './IndexesList.types'
import {
  INDEXES_LIST_COLUMN_HEADERS,
  INDEXES_LIST_COLUMN_TOOLTIPS,
} from './constants'
import { NameCell } from './components/NameCell'
import { PrefixCell } from './components/PrefixCell'
import { FieldTypesCell } from './components/FieldTypesCell'
import { NumericCell } from './components/NumericCell'
import { ActionsCell } from './components/ActionsCell'
import { ColumnHeader } from './components/ColumnHeader/ColumnHeader'

export const INDEXES_LIST_COLUMNS: ColumnDef<IndexListRow>[] = [
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
    header: () => (
      <ColumnHeader
        label={INDEXES_LIST_COLUMN_HEADERS[IndexesListColumn.Prefix]}
        tooltip={INDEXES_LIST_COLUMN_TOOLTIPS[IndexesListColumn.Prefix]}
      />
    ),
    enableSorting: false,
    cell: PrefixCell,
    size: 170,
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
    accessorKey: 'numRecords',
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
    accessorKey: 'numTerms',
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
    accessorKey: 'numFields',
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
  {
    id: IndexesListColumn.Actions,
    header: INDEXES_LIST_COLUMN_HEADERS[IndexesListColumn.Actions],
    enableSorting: false,
    size: 150,
    cell: ActionsCell,
  },
]
