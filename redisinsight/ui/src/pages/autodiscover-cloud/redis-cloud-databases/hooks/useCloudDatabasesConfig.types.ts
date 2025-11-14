import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import { ColumnDef, RowSelectionState } from 'uiSrc/components/base/layout/table'

export interface UseCloudDatabasesConfigReturn {
  columns: ColumnDef<InstanceRedisCloud>[]
  selection: InstanceRedisCloud[]
  instances: InstanceRedisCloud[] | null
  loading: boolean
  handleClose: () => void
  handleBackAdding: () => void
  handleAddInstances: (
    databases: Pick<InstanceRedisCloud, 'subscriptionId' | 'databaseId' | 'free'>[]
  ) => void
  handleSelectionChange: (currentSelected: RowSelectionState) => void
}

