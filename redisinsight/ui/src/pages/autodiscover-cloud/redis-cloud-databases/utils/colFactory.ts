import { type InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { getSelectionColumn } from 'uiSrc/pages/autodiscover-cloud/utils'
import {
  databaseColumn,
  endpointColumn,
  modulesColumn,
  optionsColumn,
  statusDbColumn,
  subscriptionDbColumn,
  subscriptionIdColumn,
  subscriptionTypeColumn,
} from '../../column-definitions'

export const colFactory = (instances: InstanceRedisCloud[]): ColumnDef<InstanceRedisCloud>[] => {
  const columns: ColumnDef<InstanceRedisCloud>[] = [
    databaseColumn(),
    subscriptionIdColumn(),
    subscriptionDbColumn(),
    subscriptionTypeColumn(),
    statusDbColumn(),
    endpointColumn(),
    modulesColumn(),
    optionsColumn(instances),
  ]

  if (instances.length) {
    return [getSelectionColumn<InstanceRedisCloud>(), ...columns]
  }

  return columns
}

