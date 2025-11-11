import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCluster } from 'uiSrc/slices/interfaces'

export const StatusColumn = (): ColumnDef<InstanceRedisCluster> => {
  return {
    header: 'Status',
    id: 'status',
    accessorKey: 'status',
    enableSorting: true,
  }
}
