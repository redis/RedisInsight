import React from 'react'

import { ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'

import { DatabaseCell } from './components/DatabaseCell/DatabaseCell'

export const DATABASE_COLUMN_ID = 'name' as const

export const databaseColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Database',
    id: DATABASE_COLUMN_ID,
    accessorKey: DATABASE_COLUMN_ID,
    enableSorting: true,
    maxSize: 150,
    cell: ({
      row: {
        original: { name },
      },
    }) => <DatabaseCell name={name} />,
  }
}
