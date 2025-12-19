import {
  RedisDefaultModules,
  AddRedisClusterDatabaseOptions,
  type InstanceRedisCloud,
} from 'uiSrc/slices/interfaces'
import { colFactory } from './colFactory'
import { RedisCloudInstanceFactory } from 'uiSrc/mocks/factories/cloud/RedisCloudInstance.factory'
import { AutoDiscoverCloudIds } from 'uiSrc/pages/autodiscover-cloud/constants/constants'

describe('colFactory', () => {
  it('should return base columns without modules and options when instances array is empty', () => {
    const instances: InstanceRedisCloud[] = []

    const columns = colFactory(instances, instances)

    expect(columns).toHaveLength(7)
    expect(columns.map((col) => col.id)).toEqual([
      AutoDiscoverCloudIds.Name,
      AutoDiscoverCloudIds.SubscriptionId,
      AutoDiscoverCloudIds.SubscriptionName,
      AutoDiscoverCloudIds.SubscriptionType,
      AutoDiscoverCloudIds.Status,
      AutoDiscoverCloudIds.PublicEndpoint,
      AutoDiscoverCloudIds.MessageAdded,
    ])
  })

  it('should return base columns without modules and options when instances have no modules or options', () => {
    const instances = RedisCloudInstanceFactory.buildList(1, {
      modules: [],
      options: undefined,
    })

    const columns = colFactory(instances, instances)

    expect(columns).toHaveLength(7)
    expect(columns.map((col) => col.id)).toEqual([
      AutoDiscoverCloudIds.Name,
      AutoDiscoverCloudIds.SubscriptionId,
      AutoDiscoverCloudIds.SubscriptionName,
      AutoDiscoverCloudIds.SubscriptionType,
      AutoDiscoverCloudIds.Status,
      AutoDiscoverCloudIds.PublicEndpoint,
      AutoDiscoverCloudIds.MessageAdded,
    ])
  })

  it('should include modules column when at least one instance has modules', () => {
    const instances = [
      RedisCloudInstanceFactory.build({ modules: [], options: undefined }),
      RedisCloudInstanceFactory.build({
        modules: [RedisDefaultModules.ReJSON],
        options: undefined,
      }),
    ]

    const columns = colFactory(instances, instances)

    expect(columns).toHaveLength(8)
    expect(columns.map((col) => col.id)).toContain(AutoDiscoverCloudIds.Modules)
    expect(columns[6].id).toBe(AutoDiscoverCloudIds.Modules)
    expect(columns.map((col) => col.id)).not.toContain(
      AutoDiscoverCloudIds.Options,
    )
  })

  it('should include options column when at least one instance has options with truthy values', () => {
    const instances = [
      RedisCloudInstanceFactory.build({ modules: [], options: {} }),
      RedisCloudInstanceFactory.build({
        modules: [],
        options: {
          [AddRedisClusterDatabaseOptions.Backup]: true,
          [AddRedisClusterDatabaseOptions.Clustering]: false,
        },
      }),
    ]

    const columns = colFactory(instances, instances)

    expect(columns).toHaveLength(8)
    expect(columns.map((col) => col.id)).toContain(AutoDiscoverCloudIds.Options)
    expect(columns[6].id).toBe(AutoDiscoverCloudIds.Options)
    expect(columns.map((col) => col.id)).not.toContain(
      AutoDiscoverCloudIds.Modules,
    )
  })
  it('should include both modules and options columns when instances have both', () => {
    const instances = RedisCloudInstanceFactory.buildList(1, {
      modules: [RedisDefaultModules.ReJSON],
      options: {
        [AddRedisClusterDatabaseOptions.Backup]: true,
      },
    })

    const columns = colFactory(instances, instances)

    expect(columns).toHaveLength(9)
    expect(columns.map((col) => col.id)).toEqual([
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

  it('should always have message column as the last column', () => {
    const instancesWithModules = RedisCloudInstanceFactory.buildList(1, {
      modules: [RedisDefaultModules.ReJSON],
      options: undefined,
    })

    const columnsWithModules = colFactory(
      instancesWithModules,
      instancesWithModules,
    )
    expect(columnsWithModules[columnsWithModules.length - 1].id).toBe(
      AutoDiscoverCloudIds.MessageAdded,
    )

    const instancesWithOptions = RedisCloudInstanceFactory.buildList(1, {
      modules: [],
      options: { [AddRedisClusterDatabaseOptions.Backup]: true },
    })

    const columnsWithOptions = colFactory(
      instancesWithOptions,
      instancesWithOptions,
    )
    expect(columnsWithOptions[columnsWithOptions.length - 1].id).toBe(
      AutoDiscoverCloudIds.MessageAdded,
    )

    const instancesWithBoth = RedisCloudInstanceFactory.buildList(1, {
      modules: [RedisDefaultModules.ReJSON],
      options: { [AddRedisClusterDatabaseOptions.Backup]: true },
    })

    const columnsWithBoth = colFactory(instancesWithBoth, instancesWithBoth)
    expect(columnsWithBoth[columnsWithBoth.length - 1].id).toBe(
      AutoDiscoverCloudIds.MessageAdded,
    )
  })
})
