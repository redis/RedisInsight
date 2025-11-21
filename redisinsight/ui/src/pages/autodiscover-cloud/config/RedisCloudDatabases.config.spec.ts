import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import { redisCloudDatabasesColumns } from './RedisCloudDatabases.config'
import { AutoDiscoverCloudIds } from '../constants/constants'

describe('RedisCloudDatabases.config', () => {
  it('should return all column definitions in correct order', () => {
    const instances: InstanceRedisCloud[] = [
      { databaseId: 1, name: 'test-db' } as any,
    ]
    const columns = redisCloudDatabasesColumns(instances)

    const columnIds = columns.map((col) => col.id)

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

  it('should pass instances via meta.props for options column', () => {
    const instances: InstanceRedisCloud[] = [
      { databaseId: 1, name: 'test-db' } as any,
      { databaseId: 2, name: 'test-db-2' } as any,
    ]

    const columns = redisCloudDatabasesColumns(instances)

    const optionsColumn = columns.find(
      (col) => col.id === AutoDiscoverCloudIds.Options,
    )
    expect(optionsColumn?.meta?.props.instances).toBe(instances)
  })
})

