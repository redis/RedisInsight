import React from 'react'

import { ColumnDef, Row } from 'uiSrc/components/base/layout/table'
import { VectorSetElement } from 'uiSrc/slices/interfaces'
import { ElementNameCell } from './components/ElementNameCell/ElementNameCell'
import {
  GetColumnsOptions,
  VectorSetColumn,
} from './VectorSetElementList.types'
import { VECTOR_SET_COLUMN_HEADERS } from './constants'

const createNameColumn = ({
  compressor,
  viewFormat,
}: GetColumnsOptions): ColumnDef<VectorSetElement> => ({
  id: VectorSetColumn.Name,
  accessorKey: VectorSetColumn.Name,
  header: VECTOR_SET_COLUMN_HEADERS[VectorSetColumn.Name],
  enableSorting: false,
  size: 100,
  cell: ({ row }: { row: Row<VectorSetElement> }) => (
    <ElementNameCell
      element={row.original}
      compressor={compressor}
      viewFormat={viewFormat}
    />
  ),
})

const ACTIONS_COLUMN: ColumnDef<VectorSetElement> = {
  id: VectorSetColumn.Actions,
  header: VECTOR_SET_COLUMN_HEADERS[VectorSetColumn.Actions],
  enableSorting: false,
  size: 10,
  cell: () => null,
}

export const getVectorSetColumns = (
  options: GetColumnsOptions,
): ColumnDef<VectorSetElement>[] => [createNameColumn(options), ACTIONS_COLUMN]
