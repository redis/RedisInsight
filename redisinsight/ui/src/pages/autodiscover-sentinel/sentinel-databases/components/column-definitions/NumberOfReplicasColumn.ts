import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'

export const NumberOfReplicasColumn = (): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: '# of replicas',
    id: 'numberOfSlaves',
    accessorKey: 'numberOfSlaves',
    enableSorting: true,
    size: 120,
  }
}
