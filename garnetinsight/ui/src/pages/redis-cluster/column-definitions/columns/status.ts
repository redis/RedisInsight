import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCluster } from 'uiSrc/slices/interfaces'
import {
  RedisClusterIds,
  RedisClusterTitles,
} from 'uiSrc/pages/redis-cluster/constants/constants'

export const statusColumn = (): ColumnDef<InstanceRedisCluster> => {
  return {
    header: RedisClusterTitles.Status,
    id: RedisClusterIds.Status,
    accessorKey: RedisClusterIds.Status,
    enableSorting: true,
    size: 100,
  }
}

