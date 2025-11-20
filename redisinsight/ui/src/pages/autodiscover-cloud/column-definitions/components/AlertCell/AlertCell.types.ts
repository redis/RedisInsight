import { RedisCloudSubscription } from 'uiSrc/slices/interfaces'

export interface AlertCellProps {
  status: RedisCloudSubscription['status']
  numberOfDatabases: RedisCloudSubscription['numberOfDatabases']
}

