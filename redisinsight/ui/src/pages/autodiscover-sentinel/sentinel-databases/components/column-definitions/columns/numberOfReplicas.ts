import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'

import {
  SentinelDatabaseIds,
  SentinelDatabaseTitles,
} from 'uiSrc/pages/autodiscover-sentinel/constants/constants'

export const numberOfReplicasColumn = (): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: SentinelDatabaseTitles.NumberOfReplicas,
    id: SentinelDatabaseIds.NumberOfReplicas,
    accessorKey: SentinelDatabaseIds.NumberOfReplicas,
    enableSorting: true,
    size: 120,
  }
}
