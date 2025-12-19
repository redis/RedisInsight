import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import {
  databaseResultColumn,
  subscriptionIdResultColumn,
  subscriptionDbResultColumn,
  subscriptionTypeResultColumn,
  statusDbResultColumn,
  endpointResultColumn,
  modulesResultColumn,
  optionsResultColumn,
  messageResultColumn,
} from '../../column-definitions'

export const colFactory = (
  instances: InstanceRedisCloud[] = [],
  instancesForOptions: InstanceRedisCloud[] = [],
): ColumnDef<InstanceRedisCloud>[] => {
  const shouldShowCapabilities = instances.some(
    (instance) => instance.modules?.length,
  )
  const shouldShowOptions = instances.some(
    (instance) =>
      instance.options &&
      Object.values(instance.options).filter(Boolean).length,
  )

  const columns: ColumnDef<InstanceRedisCloud>[] = [
    databaseResultColumn(),
    subscriptionIdResultColumn(),
    subscriptionDbResultColumn(),
    subscriptionTypeResultColumn(),
    statusDbResultColumn(),
    endpointResultColumn(),
  ]

  if (shouldShowCapabilities) {
    columns.push(modulesResultColumn())
  }

  if (shouldShowOptions) {
    columns.push(optionsResultColumn(instancesForOptions))
  }

  columns.push(messageResultColumn())

  return columns
}
