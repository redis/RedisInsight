import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import {
  type InstanceRedisCloud,
  RedisCloudSubscriptionTypeText,
} from 'uiSrc/slices/interfaces'

export const SUBSCRIPTION_TYPE_RESULT_COLUMN_ID = 'subscriptionType' as const

export const subscriptionTypeResultColumn =
  (): ColumnDef<InstanceRedisCloud> => {
    return {
      header: 'Type',
      id: SUBSCRIPTION_TYPE_RESULT_COLUMN_ID,
      accessorKey: SUBSCRIPTION_TYPE_RESULT_COLUMN_ID,
      enableSorting: true,
      size: 95,
      cell: ({
        row: {
          original: { subscriptionType },
        },
      }) => RedisCloudSubscriptionTypeText[subscriptionType!] ?? '-',
    }
  }
