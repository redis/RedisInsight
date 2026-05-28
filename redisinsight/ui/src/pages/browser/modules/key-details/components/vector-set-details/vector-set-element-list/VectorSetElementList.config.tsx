import React from 'react'

import { ColumnDef, Row as TableRow } from 'uiSrc/components/base/layout/table'
import { VectorSetElement } from 'uiSrc/slices/interfaces'

import { ElementNameCell } from './components/ElementNameCell/ElementNameCell'
import { RowActionsCell } from './components/RowActionsCell/RowActionsCell'
import {
  ElementsListConfig,
  VectorSetColumn,
} from './VectorSetElementList.types'
import { VECTOR_SET_COLUMN_HEADERS } from './constants'

const createNameColumn = (
  listConfig: ElementsListConfig,
): ColumnDef<VectorSetElement> => {
  const { compressor, viewFormat } = listConfig
  return {
    id: VectorSetColumn.Name,
    accessorKey: VectorSetColumn.Name,
    header: VECTOR_SET_COLUMN_HEADERS[VectorSetColumn.Name],
    enableSorting: false,
    cell: ({ row }: { row: TableRow<VectorSetElement> }) => (
      <ElementNameCell
        element={row.original}
        compressor={compressor}
        viewFormat={viewFormat}
      />
    ),
  }
}

const createActionsColumn = (
  listConfig: ElementsListConfig,
): ColumnDef<VectorSetElement> => ({
  id: VectorSetColumn.Actions,
  header: VECTOR_SET_COLUMN_HEADERS[VectorSetColumn.Actions],
  enableSorting: false,
  enableResizing: false,
  size: 100,
  sizeUnit: 'px',
  cell: ({ row }: { row: TableRow<VectorSetElement> }) => (
    <RowActionsCell
      target={row.original}
      actionsConfig={listConfig.actionsConfig}
      viewFormat={listConfig.viewFormat}
      testIdPrefix="vector-set"
    />
  ),
})

export const getVectorSetColumns = (
  listConfig: ElementsListConfig,
): ColumnDef<VectorSetElement>[] => [
  createNameColumn(listConfig),
  createActionsColumn(listConfig),
]
