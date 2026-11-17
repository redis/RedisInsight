import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCluster } from 'uiSrc/slices/interfaces'
import i18n from 'uiSrc/i18n'
import { RedisClusterIds } from 'uiSrc/pages/redis-cluster/constants/constants'

export const statusColumn = (): ColumnDef<InstanceRedisCluster> => {
  return {
    header: i18n.t('cluster.column.status'),
    id: RedisClusterIds.Status,
    accessorKey: RedisClusterIds.Status,
    enableSorting: true,
    size: 100,
  }
}
