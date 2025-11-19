import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'

import {
  ColumnDefinitionIds,
  ColumnDefinitionTitles,
} from 'uiSrc/pages/autodiscover-sentinel/constants/constants'

export const numberOfReplicasColumn = (): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: ColumnDefinitionTitles.NumberOfReplicas,
    id: ColumnDefinitionIds.NumberOfReplicas,
    accessorKey: ColumnDefinitionIds.NumberOfReplicas,
    enableSorting: true,
    size: 120,
  }
}
