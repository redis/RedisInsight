import React from 'react'

import { ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'

import { DatabaseCell } from './components/DatabaseCell/DatabaseCell'

export const databaseColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Database',
    id: 'name',
    accessorKey: 'name',
    enableSorting: true,
    maxSize: 150,
    cell: ({
      row: {
        original: { name },
      },
    }) => <DatabaseCell name={name} />,
  }
}
