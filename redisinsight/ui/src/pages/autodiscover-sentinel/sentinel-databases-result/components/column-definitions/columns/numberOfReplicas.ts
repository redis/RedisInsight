import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import i18n from 'uiSrc/i18n'
import { SentinelDatabaseIds } from 'uiSrc/pages/autodiscover-sentinel/constants/constants'

export const numberOfReplicasColumn = (): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: i18n.t('autodiscover.sentinel.column.numberOfReplicas'),
    id: SentinelDatabaseIds.NumberOfReplicas,
    accessorKey: SentinelDatabaseIds.NumberOfReplicas,
    enableSorting: true,
    maxSize: 120,
  }
}
