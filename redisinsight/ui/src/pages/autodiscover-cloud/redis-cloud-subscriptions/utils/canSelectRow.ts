import { Row } from 'uiSrc/components/base/layout/table'
import {
  RedisCloudSubscription,
  RedisCloudSubscriptionStatus,
} from 'uiSrc/slices/interfaces'

export function canSelectRow({
  original,
}: Row<RedisCloudSubscription>): boolean {
  return (
    original.status === RedisCloudSubscriptionStatus.Active &&
    original.numberOfDatabases !== 0
  )
}
