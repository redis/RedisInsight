import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import {
  InstanceRedisCloud,
  RedisCloudSubscriptionTypeText,
} from 'uiSrc/slices/interfaces'

export const subscriptionTypeResultColumn =
  (): ColumnDef<InstanceRedisCloud> => {
    return {
      header: 'Type',
      id: 'subscriptionType',
      accessorKey: 'subscriptionType',
      enableSorting: true,
      size: 95,
      cell: ({
        row: {
          original: { subscriptionType },
        },
      }) => RedisCloudSubscriptionTypeText[subscriptionType!] ?? '-',
    }
  }
