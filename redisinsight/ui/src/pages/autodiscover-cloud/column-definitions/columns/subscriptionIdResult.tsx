import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCloud } from 'uiSrc/slices/interfaces'

export const SUBSCRIPTION_ID_RESULT_COLUMN_ID = 'subscriptionId' as const

export const subscriptionIdResultColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Subscription ID',
    id: SUBSCRIPTION_ID_RESULT_COLUMN_ID,
    accessorKey: SUBSCRIPTION_ID_RESULT_COLUMN_ID,
    enableSorting: true,
    maxSize: 150,
  }
}
