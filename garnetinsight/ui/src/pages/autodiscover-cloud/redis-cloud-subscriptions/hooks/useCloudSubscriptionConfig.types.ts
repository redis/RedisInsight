import {
  ColumnDef,
  RowSelectionState,
} from 'uiSrc/components/base/layout/table'
import {
  InstanceRedisCloud,
  RedisCloudAccount,
  RedisCloudSubscription,
} from 'uiSrc/slices/interfaces'
import { Maybe } from 'uiSrc/utils'

export interface UseCloudSubscriptionConfigReturn {
  columns: ColumnDef<RedisCloudSubscription>[]
  selection: RedisCloudSubscription[]
  loading: boolean
  account: RedisCloudAccount | null
  subscriptions: RedisCloudSubscription[] | null
  subscriptionsError: string
  accountError: string
  handleClose: () => void
  handleBackAdding: () => void
  handleLoadInstances: (
    subscriptions: Maybe<
      Pick<InstanceRedisCloud, 'subscriptionId' | 'subscriptionType' | 'free'>
    >[],
  ) => void
  handleSelectionChange: (currentSelected: RowSelectionState) => void
}
