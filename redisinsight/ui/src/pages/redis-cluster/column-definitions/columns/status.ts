import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCluster } from 'uiSrc/slices/interfaces'

export const statusColumn = (): ColumnDef<InstanceRedisCluster> => {
  return {
    header: 'Status',
    id: 'status',
    accessorKey: 'status',
    enableSorting: true,
    size: 100,
  }
}

