import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import { ColumnDefinitionTitles } from './constants'

export const NumberOfReplicasColumn = (): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: ColumnDefinitionTitles.NumberOfReplicas,
    id: 'numberOfSlaves',
    accessorKey: 'numberOfSlaves',
    enableSorting: true,
    size: 120,
  }
}
