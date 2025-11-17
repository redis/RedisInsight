import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCluster } from 'uiSrc/slices/interfaces'

import { DatabaseCell } from '../components/DatabaseCell'

export const databaseColumn = (): ColumnDef<InstanceRedisCluster> => {
  return {
    header: 'Database',
    id: 'name',
    accessorKey: 'name',
    minSize: 180,
    enableSorting: true,
    cell: ({
      row: {
        original: { name },
      },
    }) => <DatabaseCell name={name} />,
  }
}

