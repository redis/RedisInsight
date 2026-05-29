import React from 'react'

import { CellContext, ColumnDef } from 'uiSrc/components/base/layout/table'
import { VectorSetElement } from 'uiSrc/slices/interfaces'

import { ElementNameCell } from './components/ElementNameCell/ElementNameCell'
import { RowActionsCell } from './components/RowActionsCell/RowActionsCell'
import {
  ElementsListConfig,
  VectorSetColumn,
} from './VectorSetElementList.types'
import {
  ACTIONS_COLUMN_SIZE,
  MIN_COLUMN_WIDTH,
  MIN_TABLE_WIDTH_FLOOR,
  VECTOR_SET_COLUMN_HEADERS,
} from './constants'

const nameColumn: ColumnDef<VectorSetElement> = {
  id: VectorSetColumn.Name,
  accessorKey: VectorSetColumn.Name,
  header: VECTOR_SET_COLUMN_HEADERS[VectorSetColumn.Name],
  enableSorting: false,
  cell: ({ row, table }: CellContext<VectorSetElement, unknown>) => {
    const { compressor, viewFormat } = table.options.meta as ElementsListConfig
    return (
      <ElementNameCell
        element={row.original}
        compressor={compressor}
        viewFormat={viewFormat}
      />
    )
  },
}

const actionsColumn: ColumnDef<VectorSetElement> = {
  id: VectorSetColumn.Actions,
  header: VECTOR_SET_COLUMN_HEADERS[VectorSetColumn.Actions],
  enableSorting: false,
  enableResizing: false,
  size: ACTIONS_COLUMN_SIZE,
  sizeUnit: 'px',
  cell: ({ row, table }: CellContext<VectorSetElement, unknown>) => {
    const { actionsConfig, viewFormat } = table.options
      .meta as ElementsListConfig
    return (
      <RowActionsCell
        target={row.original}
        actionsConfig={actionsConfig}
        viewFormat={viewFormat}
        testIdPrefix="vector-set"
      />
    )
  },
}

/**
 * Static column definitions for the vector-set element list. Cells read the
 * shared `ElementsListConfig` from `table.options.meta` at render time, so
 * the array itself doesn't need to be rebuilt when listConfig changes.
 */
export const vectorSetColumns: ColumnDef<VectorSetElement>[] = [
  nameColumn,
  actionsColumn,
]

/**
 * The element-list column set is static, so the table-min-width is computed
 * once at module scope — no need to recalculate per render.
 */
export const TABLE_MIN_WIDTH = `${Math.max(
  vectorSetColumns.length * MIN_COLUMN_WIDTH,
  MIN_TABLE_WIDTH_FLOOR,
)}px`
