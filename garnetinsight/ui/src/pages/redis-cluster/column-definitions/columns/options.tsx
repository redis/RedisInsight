import React from 'react'
import { DatabaseListOptions } from 'uiSrc/components'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCluster } from 'uiSrc/slices/interfaces'
import { parseInstanceOptionsCluster } from 'uiSrc/utils'
import {
  RedisClusterIds,
  RedisClusterTitles,
} from 'uiSrc/pages/redis-cluster/constants/constants'

export const optionsColumn = (
  instances: InstanceRedisCluster[],
): ColumnDef<InstanceRedisCluster> => {
  return {
    header: RedisClusterTitles.Options,
    id: RedisClusterIds.Options,
    accessorKey: RedisClusterIds.Options,
    enableSorting: true,
    maxSize: 180,
    cell: ({ row: { original: instance } }) => {
      const options = parseInstanceOptionsCluster(instance?.uid, instances)
      return <DatabaseListOptions options={options} />
    },
  }
}

