import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import {
  AutoDiscoverCloudIds,
  AutoDiscoverCloudTitles,
} from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const subscriptionIdResultColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: AutoDiscoverCloudTitles.SubscriptionId,
    id: AutoDiscoverCloudIds.SubscriptionId,
    accessorKey: AutoDiscoverCloudIds.SubscriptionId,
    enableSorting: true,
    maxSize: 150,
  }
}
