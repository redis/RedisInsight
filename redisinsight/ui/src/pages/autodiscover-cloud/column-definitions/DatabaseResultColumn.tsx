import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'

import { DatabaseCell } from './components/DatabaseCell/DatabaseCell'

export const DATABASE_RESULT_COLUMN_ID = 'name' as const

export const databaseResultColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Database',
    id: DATABASE_RESULT_COLUMN_ID,
    accessorKey: DATABASE_RESULT_COLUMN_ID,
    enableSorting: true,
    maxSize: 120,
    cell: ({
      row: {
        original: { name },
      },
    }) => <DatabaseCell name={name} />,
  }
}
