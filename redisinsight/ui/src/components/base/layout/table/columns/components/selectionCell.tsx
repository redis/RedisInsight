import React from 'react'
import { CellContext, Table } from 'uiSrc/components/base/layout/table'

export const SelectionCell = <T extends object>({
  row,
  column,
}: CellContext<T, unknown>) => (
  <Table.RowSelectionButton row={row} data-testid={`${column.id}-${row.id}`} />
)
