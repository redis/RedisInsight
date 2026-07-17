import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCluster } from 'uiSrc/slices/interfaces'

import i18n from 'uiSrc/i18n'
import { DatabaseCell } from '../components/DatabaseCell'
import { RedisClusterIds } from 'uiSrc/pages/redis-cluster/constants/constants'

export const databaseColumn = (): ColumnDef<InstanceRedisCluster> => {
  return {
    header: i18n.t('cluster.column.database'),
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
