import { RedisCloudSubscription } from 'uiSrc/slices/interfaces'

export interface AlertCellRendererProps {
  status: RedisCloudSubscription['status']
  numberOfDatabases: RedisCloudSubscription['numberOfDatabases']
}

