import React from 'react'
import { type ColumnDef, Table } from 'uiSrc/components/base/layout/table'

type Props = {
  size?: number
  id?: string
}

/**
 * @see [Row selection]{@link https://redislabsdev.github.io/redis-ui/?path=/docs/table-table-rowselection--docs#usage}
 */
export const getSelectionColumn = <T extends object>({
  size = 50,
  id = 'row-selection',
}: Props = {}): ColumnDef<T> => {
  return {
    id,
    size,
    isHeaderCustom: true,
    header: ({ table }) => (
      <Table.HeaderMultiRowSelectionButton table={table} />
    ),
    cell: ({ row }) => {
      return <Table.RowSelectionButton row={row} />
    },
  }
}
