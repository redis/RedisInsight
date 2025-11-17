import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'

export const numberOfReplicasColumn = (): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: '# of replicas',
    id: 'numberOfSlaves',
    accessorKey: 'numberOfSlaves',
    enableSorting: true,
    size: 120,
  }
}
