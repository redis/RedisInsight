import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import {
  type InstanceRedisCloud,
  RedisCloudSubscriptionTypeText,
} from 'uiSrc/slices/interfaces'
import i18n from 'uiSrc/i18n'
import { AutoDiscoverCloudIds } from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const subscriptionTypeResultColumn =
  (): ColumnDef<InstanceRedisCloud> => {
    return {
      header: i18n.t('autodiscover.cloud.column.type'),
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
