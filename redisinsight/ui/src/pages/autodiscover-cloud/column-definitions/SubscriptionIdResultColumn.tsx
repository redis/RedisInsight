import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'

export const SubscriptionIdResultColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Subscription ID',
    id: 'subscriptionId',
    accessorKey: 'subscriptionId',
    enableSorting: true,
    maxSize: 150,
  }
}
