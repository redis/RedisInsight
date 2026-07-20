import React from 'react'

import i18n from 'uiSrc/i18n'
import { ColumnDef, Row } from 'uiSrc/components/base/layout/table'

import {
  IndexListRow,
  IndexListColumn,
  IndexListAction,
} from './IndexList.types'
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
  header: '',
  enableSorting: false,
  enableResizing: false,
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

// Columns are built per call (at render) so i18n.t() reflects the active
// language — a module-level column list would capture it at import time.
export const getIndexListColumns = (options?: {
  onQueryClick?: (indexName: string) => void
  actions?: IndexListAction[]
}): ColumnDef<IndexListRow>[] => {
  const actions = options?.actions ?? []
  return [
    {
      id: IndexListColumn.Name,
      accessorKey: IndexListColumn.Name,
      header: i18n.t('vectorSearch.list.column.name'),
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
          label={i18n.t('vectorSearch.list.column.prefix')}
          tooltip={i18n.t('vectorSearch.list.tooltip.prefix')}
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
      header: i18n.t('vectorSearch.list.column.types'),
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
          label={i18n.t('vectorSearch.list.column.docs')}
          tooltip={i18n.t('vectorSearch.list.tooltip.docs')}
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
          label={i18n.t('vectorSearch.list.column.records')}
          tooltip={i18n.t('vectorSearch.list.tooltip.records')}
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
          label={i18n.t('vectorSearch.list.column.terms')}
          tooltip={i18n.t('vectorSearch.list.tooltip.terms')}
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
      sortingFn: (rowA, rowB) =>
        rowA.original.numTerms - rowB.original.numTerms,
    },
    {
      id: IndexListColumn.Fields,
      accessorKey: IndexListColumn.Fields,
      header: () => (
        <ColumnHeader
          label={i18n.t('vectorSearch.list.column.fields')}
          tooltip={i18n.t('vectorSearch.list.tooltip.fields')}
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
    createActionsColumn(options?.onQueryClick, actions),
  ]
}
