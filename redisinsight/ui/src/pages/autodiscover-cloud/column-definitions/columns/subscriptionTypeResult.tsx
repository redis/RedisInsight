import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import {
  type InstanceRedisCloud,
  RedisCloudSubscriptionTypeText,
} from 'uiSrc/slices/interfaces'
import { AutoDiscoverCloudIds } from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const subscriptionTypeResultColumn =
  (): ColumnDef<InstanceRedisCloud> => {
    return {
      header: 'Type',
      id: AutoDiscoverCloudIds.SubscriptionType,
      accessorKey: AutoDiscoverCloudIds.SubscriptionType,
      enableSorting: true,
      size: 95,
      cell: ({
        row: {
          original: { subscriptionType },
        },
      }) => RedisCloudSubscriptionTypeText[subscriptionType!] ?? '-',
    }
  }
