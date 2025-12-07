import { ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'

export interface UseCloudDatabasesResultConfigReturn {
  instances: InstanceRedisCloud[]
  columns: ColumnDef<InstanceRedisCloud>[]
  handleClose: () => void
  handleBackAdding: () => void
}

