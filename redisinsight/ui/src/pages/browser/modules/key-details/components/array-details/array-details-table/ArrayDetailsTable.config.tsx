import React from 'react'

import { CellContext, ColumnDef } from 'uiSrc/components/base/layout/table'
import { ArrayDataElement } from 'uiSrc/slices/interfaces/array'

import { ArrayIndexCell } from './components/ArrayIndexCell'
import { ArrayValueCell } from './components/ArrayValueCell'
import { ArrayTableConfig } from './ArrayDetailsTable.types'

export const TEST_ID = 'array-details-table'

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
    const { compressor, viewFormat } = table.options.meta as ArrayTableConfig
    return (
      <ArrayValueCell
        index={row.original.index}
        value={row.original.value}
        compressor={compressor}
        viewFormat={viewFormat}
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

const MIN_COLUMN_WIDTH = 160
export const TABLE_MIN_WIDTH = `${arrayColumns.length * MIN_COLUMN_WIDTH}px`
