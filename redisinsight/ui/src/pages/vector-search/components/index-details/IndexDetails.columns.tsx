import React from 'react'
import { ColumnDef, Row, Table } from 'uiSrc/components/base/layout/table'
import { IndexDetailsColumn, IndexField } from './IndexDetails.types'

import { FieldNameCell } from './components/FieldNameCell/FieldNameCell'
import { FieldValueCell } from './components/FieldValueCell/FieldValueCell'
import { FieldTypeCell } from './components/FieldTypeCell/FieldTypeCell'
import { FieldActionsCell } from './components/FieldActionsCell/FieldActionsCell'
import { ColumnHeader } from './components/ColumnHeader/ColumnHeader'
import { FieldNameTooltip } from './components/FieldNameCell/FieldNameTooltip'
import { FieldValueTooltip } from './components/FieldValueCell/FieldValueTooltip'
import { FieldTypeTooltip } from './components/FieldTypeCell/FieldTypeTooltip'

export const SELECTION_COLUMN: ColumnDef<IndexField> = {
  id: IndexDetailsColumn.Selection,
  size: 50,
  sizeUnit: 'px',
  enableSorting: false,
  header: Table.HeaderMultiRowSelectionButton,
  cell: ({ row }) => <Table.RowSelectionButton row={row} />,
}

export const NAME_COLUMN: ColumnDef<IndexField> = {
  id: IndexDetailsColumn.Name,
  accessorKey: IndexDetailsColumn.Name,
  enableSorting: false,
  header: () => (
    <ColumnHeader label="Field name" tooltip={<FieldNameTooltip />} />
  ),
  cell: ({ row }: { row: Row<IndexField> }) => (
    <FieldNameCell field={row.original} />
  ),
}

export const VALUE_COLUMN: ColumnDef<IndexField> = {
  id: IndexDetailsColumn.Value,
  accessorKey: IndexDetailsColumn.Value,
  enableSorting: false,
  header: () => (
    <ColumnHeader label="Field sample value" tooltip={<FieldValueTooltip />} />
  ),
  cell: ({ row }: { row: Row<IndexField> }) => (
    <FieldValueCell field={row.original} />
  ),
}

export const TYPE_COLUMN_READONLY: ColumnDef<IndexField> = {
  id: IndexDetailsColumn.Type,
  accessorKey: IndexDetailsColumn.Type,
  size: 270,
  sizeUnit: 'px',
  enableSorting: false,
  header: () => (
    <ColumnHeader label="Indexing type" tooltip={<FieldTypeTooltip />} />
  ),
  cell: ({ row }: { row: Row<IndexField> }) => (
    <FieldTypeCell field={row.original} />
  ),
}

export const TYPE_COLUMN_EDITABLE: ColumnDef<IndexField> = {
  id: IndexDetailsColumn.Type,
  accessorKey: IndexDetailsColumn.Type,
  size: 270,
  sizeUnit: 'px',
  enableSorting: false,
  header: () => (
    <ColumnHeader
      label="Suggested indexing type"
      tooltip={<FieldTypeTooltip />}
    />
  ),
  cell: ({ row }: { row: Row<IndexField> }) => (
    <FieldTypeCell field={row.original} />
  ),
}

export const createActionsColumn = (
  onFieldEdit?: (field: IndexField) => void,
): ColumnDef<IndexField> => ({
  id: IndexDetailsColumn.Actions,
  enableSorting: false,
  size: 50,
  sizeUnit: 'px',
  header: '',
  cell: ({ row }: { row: Row<IndexField> }) => (
    <FieldActionsCell field={row.original} onEdit={onFieldEdit} />
  ),
})
