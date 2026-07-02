import React from 'react'

import { CellContext, ColumnDef } from 'uiSrc/components/base/layout/table'
import { ArrayDataElement } from 'uiSrc/slices/interfaces/array'

import { ArrayIndexCell } from './components/ArrayIndexCell'
import { ArrayValueCell } from './components/ArrayValueCell'
import { RowActionsCell } from './components/RowActionsCell'
import { ArrayTableConfig } from './ArrayDetailsTable.types'

export const TEST_ID = 'array-details-table'

const ACTIONS_COLUMN_SIZE = 48

const indexColumn: ColumnDef<ArrayDataElement> = {
  id: 'index',
  accessorKey: 'index',
  header: 'Index',
  enableSorting: false,
  enableResizing: true,
  cell: ({ row }: CellContext<ArrayDataElement, unknown>) => (
    <ArrayIndexCell index={row.original.index} />
  ),
}

const valueColumn: ColumnDef<ArrayDataElement> = {
  id: 'value',
  accessorKey: 'value',
  header: 'Value',
  enableSorting: false,
  enableResizing: true,
  cell: ({ row, table }: CellContext<ArrayDataElement, unknown>) => {
    const {
      compressor,
      viewFormat,
      editingIndex,
      onEditElement,
      onApplyEditElement,
      updating,
      loading,
    } = table.options.meta as ArrayTableConfig
    const { index } = row.original
    return (
      <ArrayValueCell
        index={index}
        value={row.original.value}
        compressor={compressor}
        viewFormat={viewFormat}
        isEditing={editingIndex === index}
        updating={updating}
        loading={loading}
        onEdit={(isEditing) => onEditElement(index, isEditing)}
        onApply={(value) => onApplyEditElement(index, value)}
      />
    )
  },
}

/**
 * Per-row delete affordance, appended only when the consumer passes a
 * `deleteConfig` (via `meta`). The cell renders nothing for empty slots.
 */
export const actionsColumn: ColumnDef<ArrayDataElement> = {
  id: 'actions',
  header: '',
  enableSorting: false,
  enableResizing: false,
  size: ACTIONS_COLUMN_SIZE,
  sizeUnit: 'px',
  cell: ({ row, table }: CellContext<ArrayDataElement, unknown>) => {
    const { deleteConfig } = table.options.meta as ArrayTableConfig
    if (!deleteConfig) return null
    return <RowActionsCell element={row.original} deleteConfig={deleteConfig} />
  },
}

/**
 * Static column definitions for the array table. Cells read shared config
 * (`compressor`, `viewFormat`) from `table.options.meta` at render time,
 * so this array itself doesn't need to be rebuilt when the config changes.
 */
export const arrayColumns: ColumnDef<ArrayDataElement>[] = [
  indexColumn,
  valueColumn,
]

const MIN_COLUMN_WIDTH = 160
export const TABLE_MIN_WIDTH = `${arrayColumns.length * MIN_COLUMN_WIDTH}px`
