import { redisCloudDatabasesColumns } from './RedisCloudDatabases.config'
import { AutoDiscoverCloudIds } from '../constants/constants'

describe('RedisCloudDatabases.config', () => {
  it('should return all column definitions in correct order', () => {
    const columnIds = redisCloudDatabasesColumns.map((col) => col.id)

    expect(columnIds).toEqual([
      AutoDiscoverCloudIds.SelectionDatabases,
      AutoDiscoverCloudIds.Name,
      AutoDiscoverCloudIds.SubscriptionId,
      AutoDiscoverCloudIds.SubscriptionName,
      AutoDiscoverCloudIds.SubscriptionType,
      AutoDiscoverCloudIds.Status,
      AutoDiscoverCloudIds.PublicEndpoint,
      AutoDiscoverCloudIds.Modules,
      AutoDiscoverCloudIds.Options,
    ])
  })

  it('should include OptionsCell without meta.props', () => {
    const optionsColumn = redisCloudDatabasesColumns.find(
      (col) => col.id === AutoDiscoverCloudIds.Options,
    )
    expect(optionsColumn?.cell).toBeDefined()
    expect(optionsColumn?.meta).toBeUndefined()
  })
})
