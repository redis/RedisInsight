import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import i18n from 'uiSrc/i18n'
import { AutoDiscoverCloudIds } from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const subscriptionIdResultColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: i18n.t('autodiscover.cloud.column.subscriptionId'),
    id: AutoDiscoverCloudIds.SubscriptionId,
    accessorKey: AutoDiscoverCloudIds.SubscriptionId,
    enableSorting: true,
    maxSize: 150,
  }
}
