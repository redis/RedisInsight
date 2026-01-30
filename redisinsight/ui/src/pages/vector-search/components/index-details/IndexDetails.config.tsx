import React, { useMemo } from 'react'
import { Row } from '@tanstack/react-table'
import { ColumnDef, Table } from 'uiSrc/components/base/layout/table'
import {
  IndexDetailsColumn,
  IndexDetailsMode,
  IndexField,
} from './IndexDetails.types'

import { FieldNameCell } from './components/FieldNameCell/FieldNameCell'
import { FieldValueCell } from './components/FieldValueCell/FieldValueCell'
import { FieldTypeCell } from './components/FieldTypeCell/FieldTypeCell'
import { FieldActionsCell } from './components/FieldActionsCell/FieldActionsCell'
import { ColumnHeader } from './components/ColumnHeader/ColumnHeader'
import { FieldNameTooltip } from './components/FieldNameCell/FieldNameTooltip'
import { FieldValueTooltip } from './components/FieldValueCell/FieldValueTooltip'
import { FieldTypeTooltip } from './components/FieldTypeCell/FieldTypeTooltip'

type ColumnConfig = ColumnDef<IndexField> & {
  modes: IndexDetailsMode[]
}

interface UseColumnsOptions {
  mode: IndexDetailsMode
  onFieldEdit?: (field: IndexField) => void
}

export const useIndexDetailsColumns = ({
  mode,
  onFieldEdit,
}: UseColumnsOptions): ColumnDef<IndexField>[] => {
  const isEditable = mode === IndexDetailsMode.Editable

  const rowSelectionColumn = Table.useRowSelectionColumn<IndexField>()

  return useMemo(() => {
    const columns: ColumnConfig[] = [
      {
        ...rowSelectionColumn,
        id: IndexDetailsColumn.Selection,
        modes: [IndexDetailsMode.Editable],
      },
      {
        id: IndexDetailsColumn.Name,
        modes: [IndexDetailsMode.Editable, IndexDetailsMode.Readonly],
        accessorKey: IndexDetailsColumn.Name,
        enableSorting: false,
        header: () => (
          <ColumnHeader label="Field name" tooltip={<FieldNameTooltip />} />
        ),
        cell: ({ row }: { row: Row<IndexField> }) => (
          <FieldNameCell field={row.original} />
        ),
      },
      {
        id: IndexDetailsColumn.Value,
        modes: [IndexDetailsMode.Editable, IndexDetailsMode.Readonly],
        accessorKey: IndexDetailsColumn.Value,
        enableSorting: false,
        header: () => (
          <ColumnHeader
            label="Field sample value"
            tooltip={<FieldValueTooltip />}
          />
        ),
        cell: ({ row }: { row: Row<IndexField> }) => (
          <FieldValueCell field={row.original} />
        ),
      },
      {
        id: IndexDetailsColumn.Type,
        modes: [IndexDetailsMode.Editable, IndexDetailsMode.Readonly],
        accessorKey: IndexDetailsColumn.Type,
        enableSorting: false,
        header: () => (
          <ColumnHeader
            label={isEditable ? 'Suggested indexing type' : 'Indexing type'}
            tooltip={<FieldTypeTooltip />}
          />
        ),
        cell: ({ row }: { row: Row<IndexField> }) => (
          <FieldTypeCell field={row.original} />
        ),
      },
      {
        id: IndexDetailsColumn.Actions,
        modes: [IndexDetailsMode.Editable],
        enableSorting: false,
        size: 40,
        header: '',
        cell: ({ row }: { row: Row<IndexField> }) => (
          <FieldActionsCell field={row.original} onEdit={onFieldEdit} />
        ),
      },
    ]

    return columns
      .filter((col) => col.modes.includes(mode))
      .map(({ modes: _, ...columnDef }) => columnDef)
  }, [mode, isEditable, onFieldEdit, rowSelectionColumn])
}
