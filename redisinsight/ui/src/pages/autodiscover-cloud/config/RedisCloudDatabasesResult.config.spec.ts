import { redisCloudDatabasesResultColumns } from './RedisCloudDatabasesResult.config'
import { AutoDiscoverCloudIds } from '../constants/constants'

describe('RedisCloudDatabasesResult.config', () => {
  it('should return all column definitions in correct order', () => {
    const columnIds = redisCloudDatabasesResultColumns.map((col) => col.id)

    expect(columnIds).toEqual([
      AutoDiscoverCloudIds.Name,
      AutoDiscoverCloudIds.SubscriptionId,
      AutoDiscoverCloudIds.SubscriptionName,
      AutoDiscoverCloudIds.SubscriptionType,
      AutoDiscoverCloudIds.Status,
      AutoDiscoverCloudIds.PublicEndpoint,
      AutoDiscoverCloudIds.Modules,
      AutoDiscoverCloudIds.Options,
      AutoDiscoverCloudIds.MessageAdded,
    ])
  })

  it('should always include all columns regardless of instance data', () => {
    expect(redisCloudDatabasesResultColumns).toHaveLength(9)
    expect(redisCloudDatabasesResultColumns.map((col) => col.id)).toContain(
      AutoDiscoverCloudIds.Modules,
    )
    expect(redisCloudDatabasesResultColumns.map((col) => col.id)).toContain(
      AutoDiscoverCloudIds.Options,
    )
    expect(redisCloudDatabasesResultColumns.map((col) => col.id)).toContain(
      AutoDiscoverCloudIds.MessageAdded,
    )
  })
})
