import React from 'react'

import { CellContext, ColumnDef } from 'uiSrc/components/base/layout/table'
import { ArrayDataElement } from 'uiSrc/slices/interfaces/array'

import { ArrayIndexCell } from './components/ArrayIndexCell'
import { ArrayValueCell } from './components/ArrayValueCell'
import { RowActionsCell } from './components/RowActionsCell'
import { BulkDeleteHeaderCell } from './components/BulkDeleteHeaderCell'
import { ArrayTableConfig } from './ArrayDetailsTable.types'
import {
  ACTIONS_COLUMN_SIZE,
  INDEX_COLUMN_SIZE,
  SELECTION_COLUMN_WIDTH_REM,
  VALUE_COLUMN_SIZE,
} from './constants'

export const TEST_ID = 'array-details-table'

const indexColumn: ColumnDef<ArrayDataElement> = {
  id: 'index',
  accessorKey: 'index',
  header: 'Index',
  enableSorting: false,
  enableResizing: true,
  size: INDEX_COLUMN_SIZE,
  sizeUnit: 'px',
  cell: ({ row }: CellContext<ArrayDataElement, unknown>) => (
    <ArrayIndexCell
      index={row.original.index}
      canExpand={row.getCanExpand()}
      isExpanded={row.getIsExpanded()}
    />
  ),
}

const valueColumn: ColumnDef<ArrayDataElement> = {
  id: 'value',
  accessorKey: 'value',
  header: 'Value',
  enableSorting: false,
  enableResizing: true,
  size: VALUE_COLUMN_SIZE,
  sizeUnit: 'px',
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
 * Row-actions column hosting the per-row edit, expand and delete affordances
 * (revealed on hover). The header hosts the bulk-delete trigger (shown only
 * while rows are selected). Editing wiring is always present in `meta`, so the
 * cell derives an `editConfig` from it; `deleteConfig` is forwarded only when
 * the consumer enables deletion.
 */
export const actionsColumn: ColumnDef<ArrayDataElement> = {
  id: 'actions',
  // Custom so the header renders the bulk trigger raw, not as a column title.
  isHeaderCustom: true,
  header: ({ table }) => {
    const { bulkDeleteConfig } = table.options.meta as ArrayTableConfig
    if (!bulkDeleteConfig) return null
    return <BulkDeleteHeaderCell bulkDeleteConfig={bulkDeleteConfig} />
  },
  enableSorting: false,
  enableResizing: false,
  size: ACTIONS_COLUMN_SIZE,
  sizeUnit: 'px',
  cell: ({ row, table }: CellContext<ArrayDataElement, unknown>) => {
    const {
      compressor,
      viewFormat,
      editingIndex,
      updating,
      loading,
      onEditElement,
      onOpenValueEditor,
      deleteConfig,
    } = table.options.meta as ArrayTableConfig
    return (
      <RowActionsCell
        element={row.original}
        editConfig={{
          compressor,
          viewFormat,
          editingIndex,
          updating,
          loading,
          onEditElement,
          onOpenValueEditor,
        }}
        deleteConfig={deleteConfig}
      />
    )
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

// Width below which the table scrolls horizontally instead of squeezing the
// index/value columns. Sums every column present — including the optional
// selection (rem) and actions (px) columns, hence the calc.
export const getTableMinWidth = ({
  hasSelectionColumn,
  hasActionsColumn,
}: {
  hasSelectionColumn: boolean
  hasActionsColumn: boolean
}): string => {
  const pxColumns =
    INDEX_COLUMN_SIZE +
    VALUE_COLUMN_SIZE +
    (hasActionsColumn ? ACTIONS_COLUMN_SIZE : 0)
  return hasSelectionColumn
    ? `calc(${pxColumns}px + ${SELECTION_COLUMN_WIDTH_REM}rem)`
    : `${pxColumns}px`
}
