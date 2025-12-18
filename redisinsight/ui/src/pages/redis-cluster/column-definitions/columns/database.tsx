import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCluster } from 'uiSrc/slices/interfaces'

import { DatabaseCell } from '../components/DatabaseCell'
import {
  RedisClusterIds,
  RedisClusterTitles,
} from 'uiSrc/pages/redis-cluster/constants/constants'

export const databaseColumn = (): ColumnDef<InstanceRedisCluster> => {
  return {
    header: RedisClusterTitles.Database,
    id: RedisClusterIds.Name,
    accessorKey: RedisClusterIds.Name,
    minSize: 180,
    enableSorting: true,
    cell: ({
      row: {
        original: { name },
      },
    }) => <DatabaseCell name={name} />,
  }
}
