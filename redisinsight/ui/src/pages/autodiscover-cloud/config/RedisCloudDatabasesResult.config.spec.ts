import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import { getRedisCloudDatabasesResultColumns } from './RedisCloudDatabasesResult.config'
import { AutoDiscoverCloudIds } from '../constants/constants'

describe('RedisCloudDatabasesResult.config', () => {
  it('should return all column definitions in correct order', () => {
    const instancesForOptions: InstanceRedisCloud[] = []
    const columns = getRedisCloudDatabasesResultColumns(instancesForOptions)

    const columnIds = columns.map((col) => col.id)

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

  it('should pass instancesForOptions via meta.props for options column', () => {
    const instancesForOptions: InstanceRedisCloud[] = [
      { databaseId: 1, name: 'test-db' } as any,
      { databaseId: 2, name: 'test-db-2' } as any,
    ]

    const columns = getRedisCloudDatabasesResultColumns(instancesForOptions)

    const optionsColumn = columns.find(
      (col) => col.id === AutoDiscoverCloudIds.Options,
    )
    expect(optionsColumn?.meta?.props.instances).toBe(instancesForOptions)
  })

  it('should always include all columns regardless of instance data', () => {
    const instancesForOptions: InstanceRedisCloud[] = []
    const columns = getRedisCloudDatabasesResultColumns(instancesForOptions)

    expect(columns).toHaveLength(9)
    expect(columns.map((col) => col.id)).toContain(AutoDiscoverCloudIds.Modules)
    expect(columns.map((col) => col.id)).toContain(AutoDiscoverCloudIds.Options)
    expect(columns.map((col) => col.id)).toContain(
      AutoDiscoverCloudIds.MessageAdded,
    )
  })
})

