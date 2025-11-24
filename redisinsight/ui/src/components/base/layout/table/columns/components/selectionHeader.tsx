import React from 'react'
import { HeaderContext, Table } from 'uiSrc/components/base/layout/table'

export const SelectionHeader = <T extends object>({
  table,
  column,
}: HeaderContext<T, unknown>) => (
  <Table.HeaderMultiRowSelectionButton
    table={table}
    data-testid={`header_${column.id}`}
  />
)
