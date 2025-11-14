import {
  RedisDefaultModules,
  AddRedisClusterDatabaseOptions,
  InstanceRedisCloud,
} from 'uiSrc/slices/interfaces'
import { colFactory } from './colFactory'
import {
  DATABASE_RESULT_COLUMN_ID,
  SUBSCRIPTION_ID_RESULT_COLUMN_ID,
  SUBSCRIPTION_DB_RESULT_COLUMN_ID,
  SUBSCRIPTION_TYPE_RESULT_COLUMN_ID,
  STATUS_DB_RESULT_COLUMN_ID,
  ENDPOINT_RESULT_COLUMN_ID,
  MODULES_RESULT_COLUMN_ID,
  OPTIONS_RESULT_COLUMN_ID,
  MESSAGE_RESULT_COLUMN_ID,
} from '../../column-definitions'
import { RedisCloudInstanceFactory } from 'uiSrc/mocks/factories/cloud/RedisCloudInstance.factory'

describe('colFactory', () => {
  it('should return base columns without modules and options when instances array is empty', () => {
    const instances: InstanceRedisCloud[] = []

    const columns = colFactory(instances, instances)

    expect(columns).toHaveLength(7)
    expect(columns.map((col) => col.id)).toEqual([
      DATABASE_RESULT_COLUMN_ID,
      SUBSCRIPTION_ID_RESULT_COLUMN_ID,
      SUBSCRIPTION_DB_RESULT_COLUMN_ID,
      SUBSCRIPTION_TYPE_RESULT_COLUMN_ID,
      STATUS_DB_RESULT_COLUMN_ID,
      ENDPOINT_RESULT_COLUMN_ID,
      MESSAGE_RESULT_COLUMN_ID,
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
      DATABASE_RESULT_COLUMN_ID,
      SUBSCRIPTION_ID_RESULT_COLUMN_ID,
      SUBSCRIPTION_DB_RESULT_COLUMN_ID,
      SUBSCRIPTION_TYPE_RESULT_COLUMN_ID,
      STATUS_DB_RESULT_COLUMN_ID,
      ENDPOINT_RESULT_COLUMN_ID,
      MESSAGE_RESULT_COLUMN_ID,
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
    expect(columns.map((col) => col.id)).toContain(MODULES_RESULT_COLUMN_ID)
    expect(columns[6].id).toBe(MODULES_RESULT_COLUMN_ID)
    expect(columns.map((col) => col.id)).not.toContain(OPTIONS_RESULT_COLUMN_ID)
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
    expect(columns.map((col) => col.id)).toContain(OPTIONS_RESULT_COLUMN_ID)
    expect(columns[6].id).toBe(OPTIONS_RESULT_COLUMN_ID)
    expect(columns.map((col) => col.id)).not.toContain(MODULES_RESULT_COLUMN_ID)
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
      DATABASE_RESULT_COLUMN_ID,
      SUBSCRIPTION_ID_RESULT_COLUMN_ID,
      SUBSCRIPTION_DB_RESULT_COLUMN_ID,
      SUBSCRIPTION_TYPE_RESULT_COLUMN_ID,
      STATUS_DB_RESULT_COLUMN_ID,
      ENDPOINT_RESULT_COLUMN_ID,
      MODULES_RESULT_COLUMN_ID,
      OPTIONS_RESULT_COLUMN_ID,
      MESSAGE_RESULT_COLUMN_ID,
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
      MESSAGE_RESULT_COLUMN_ID,
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
      MESSAGE_RESULT_COLUMN_ID,
    )

    const instancesWithBoth = RedisCloudInstanceFactory.buildList(1, {
      modules: [RedisDefaultModules.ReJSON],
      options: { [AddRedisClusterDatabaseOptions.Backup]: true },
    })

    const columnsWithBoth = colFactory(instancesWithBoth, instancesWithBoth)
    expect(columnsWithBoth[columnsWithBoth.length - 1].id).toBe(
      MESSAGE_RESULT_COLUMN_ID,
    )
  })
})
