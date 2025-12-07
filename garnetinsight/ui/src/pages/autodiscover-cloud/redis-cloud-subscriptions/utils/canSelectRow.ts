import {
  RedisCloudSubscription,
  RedisCloudSubscriptionStatus,
} from 'uiSrc/slices/interfaces'

export function canSelectRow({
  original,
}: {
  original: RedisCloudSubscription
}): boolean {
  return (
    original.status === RedisCloudSubscriptionStatus.Active &&
    original.numberOfDatabases !== 0
  )
}
