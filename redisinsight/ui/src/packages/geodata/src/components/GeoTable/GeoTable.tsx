import React, { useMemo } from 'react'

import { ColumnDef, Table } from 'uiSrc/components/base/layout/table'

import { GeoTableProps } from './GeoTable.types'

type GeoTableRow = Record<string, React.ReactNode>

export const GeoTable = ({ columns, rows }: GeoTableProps) => {
  const data = useMemo<GeoTableRow[]>(
    () =>
      rows.map((row) =>
        columns.reduce<GeoTableRow>((acc, column, index) => {
          acc[column] = row[index]
          return acc
        }, {}),
      ),
    [columns, rows],
  )

  const tableColumns = useMemo<ColumnDef<GeoTableRow>[]>(
    () =>
      columns.map((column) => ({
        id: column,
        header: column,
        accessorKey: column,
        cell: ({ row: { original } }) => original[column] as React.ReactNode,
      })),
    [columns],
  )

  return <Table columns={tableColumns} data={data} />
}
