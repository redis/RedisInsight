import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import {
  InstanceRedisCloud,
  InstanceRedisClusterStatus,
  AddRedisDatabaseStatus,
  RedisCloudSubscriptionType,
  RedisDefaultModules,
  AddRedisClusterDatabaseOptions,
} from 'uiSrc/slices/interfaces'

export const RedisCloudInstanceFactory = Factory.define<InstanceRedisCloud>(
  () => {
    const host = `${faker.word.noun()}-${faker.number.int({ min: 1000, max: 99999 })}.cloud.redis.example.com`
    const port = faker.number.int({ min: 10000, max: 65535 })
    const uid = faker.number.int({ min: 1000, max: 999999 })
    const databaseId = faker.number.int({ min: 1, max: 999999 })
    const subscriptionId = faker.number.int({ min: 100000, max: 99999999 })
    const subscriptionName = `${faker.word.noun()}-subscription-${faker.number.int({ min: 100, max: 999 })}`

    // Pick a random unique subset of modules
    const allModules = Object.values(RedisDefaultModules)
    const randomModules = faker.helpers.arrayElements(
      allModules,
      faker.number.int({ min: 0, max: allModules.length }),
    ) as RedisDefaultModules[]
    const modules = Array.from(randomModules) as RedisDefaultModules[]

    return {
      accessKey: faker.string.alphanumeric(16),
      secretKey: faker.string.alphanumeric(24),
      credentials: null,
      account: null,
      host,
      port,
      uid,
      name: `${faker.word.noun()}-${faker.number.int({ min: 1000, max: 99999 })}`,
      id: faker.number.int({ min: 1, max: 999999 }),
      dnsName: host,
      address: `${host}:${port}`,
      status: faker.helpers.arrayElement([
        InstanceRedisClusterStatus.Active,
        InstanceRedisClusterStatus.Pending,
        InstanceRedisClusterStatus.ImportPending,
      ]),
      modules,
      tls: faker.datatype.boolean(),
      options: (() => {
        const persistenceChoices = [
          'aof-every-1-second',
          'aof-every-write',
          'snapshot-every-1-hour',
          'snapshot-every-6-hours',
          'snapshot-every-12-hours',
          'none',
        ] as const

        const generators: Record<string, () => any> = {
          [AddRedisClusterDatabaseOptions.ActiveActive]: () =>
            faker.datatype.boolean(),
          [AddRedisClusterDatabaseOptions.Backup]: () =>
            faker.helpers.arrayElement([
              'snapshot-every-1-hour',
              'snapshot-every-6-hours',
              'snapshot-every-12-hours',
              true,
              false,
            ]),
          [AddRedisClusterDatabaseOptions.Clustering]: () =>
            faker.datatype.boolean(),
          // Present in instanceMock examples; not in enum mapping used by UI renderer, but safe to include
          enabledDataPersistence: () => faker.datatype.boolean(),
          [AddRedisClusterDatabaseOptions.PersistencePolicy]: () =>
            faker.helpers.arrayElement<string>([
              ...persistenceChoices,
            ] as unknown as string[]),
          [AddRedisClusterDatabaseOptions.Flash]: () =>
            faker.datatype.boolean(),
          [AddRedisClusterDatabaseOptions.Replication]: () =>
            faker.datatype.boolean(),
          [AddRedisClusterDatabaseOptions.ReplicaDestination]: () =>
            faker.datatype.boolean(),
          [AddRedisClusterDatabaseOptions.ReplicaSource]: () =>
            faker.datatype.boolean(),
        }

        const keys = Object.keys(generators)
        const subsetSize = faker.number.int({ min: 0, max: keys.length })
        const selected = faker.helpers.arrayElements(keys, subsetSize)

        return selected.reduce((acc: any, key: string) => {
          acc[key] = generators[key]()
          return acc
        }, {})
      })(),
      message: undefined,
      publicEndpoint: `${host}:${port}`,
      databaseId,
      databaseIdAdded: undefined,
      subscriptionId,
      subscriptionType: faker.helpers.enumValue(RedisCloudSubscriptionType),
      subscriptionName,
      subscriptionIdAdded: undefined,
      statusAdded: faker.helpers.enumValue(AddRedisDatabaseStatus),
      messageAdded:
        faker.helpers.maybe(() => faker.lorem.sentence()) ?? undefined,
      databaseDetails: undefined,
      free: faker.datatype.boolean(),
    }
  },
)

// Predictable variants ("traits") for stories/tests
export const RedisCloudInstanceFactorySuccess =
  RedisCloudInstanceFactory.params({
    statusAdded: AddRedisDatabaseStatus.Success,
    messageAdded: 'Added successfully',
  })

export const RedisCloudInstanceFactoryFail = RedisCloudInstanceFactory.params({
  statusAdded: AddRedisDatabaseStatus.Fail,
  messageAdded: 'Failed to add database',
})

export const RedisCloudInstanceFactoryFixed = RedisCloudInstanceFactory.params({
  subscriptionType: RedisCloudSubscriptionType.Fixed,
})

export const RedisCloudInstanceFactoryFlexible =
  RedisCloudInstanceFactory.params({
    subscriptionType: RedisCloudSubscriptionType.Flexible,
  })

export const RedisCloudInstanceFactoryActive = RedisCloudInstanceFactory.params(
  { status: InstanceRedisClusterStatus.Active },
)

export const RedisCloudInstanceFactoryPending =
  RedisCloudInstanceFactory.params({
    status: InstanceRedisClusterStatus.Pending,
  })

export const RedisCloudInstanceFactoryWithoutModules =
  RedisCloudInstanceFactory.params({ modules: [] })

export const RedisCloudInstanceFactoryWithModules = (
  modules: RedisDefaultModules[],
) => RedisCloudInstanceFactory.params({ modules })

export const RedisCloudInstanceFactoryFree = RedisCloudInstanceFactory.params({
  free: true,
})

export const RedisCloudInstanceFactoryPaid = RedisCloudInstanceFactory.params({
  free: false,
})

// Option-focused traits
export const RedisCloudInstanceFactoryOptionsNone =
  RedisCloudInstanceFactory.params({
    options: {
      [AddRedisClusterDatabaseOptions.ActiveActive]: false,
      [AddRedisClusterDatabaseOptions.Backup]: false,
      [AddRedisClusterDatabaseOptions.Clustering]: false,
      enabledDataPersistence: false,
      [AddRedisClusterDatabaseOptions.PersistencePolicy]: 'none',
      [AddRedisClusterDatabaseOptions.Flash]: false,
      [AddRedisClusterDatabaseOptions.Replication]: false,
      [AddRedisClusterDatabaseOptions.ReplicaDestination]: false,
      [AddRedisClusterDatabaseOptions.ReplicaSource]: false,
    },
  })

export const RedisCloudInstanceFactoryOptionsFull =
  RedisCloudInstanceFactory.params({
    options: {
      [AddRedisClusterDatabaseOptions.ActiveActive]: true,
      // Use a concrete backup schedule value similar to instanceMock examples
      [AddRedisClusterDatabaseOptions.Backup]: 'snapshot-every-12-hours',
      [AddRedisClusterDatabaseOptions.Clustering]: true,
      enabledDataPersistence: true,
      [AddRedisClusterDatabaseOptions.PersistencePolicy]: 'aof-every-1-second',
      [AddRedisClusterDatabaseOptions.Flash]: true,
      [AddRedisClusterDatabaseOptions.Replication]: true,
      [AddRedisClusterDatabaseOptions.ReplicaDestination]: false,
      [AddRedisClusterDatabaseOptions.ReplicaSource]: false,
    },
  })

export const RedisCloudInstanceFactoryOptionsBackupSchedule = (
  schedule:
    | 'snapshot-every-1-hour'
    | 'snapshot-every-6-hours'
    | 'snapshot-every-12-hours',
) =>
  RedisCloudInstanceFactory.params({
    options: {
      [AddRedisClusterDatabaseOptions.Backup]: schedule,
    },
  })
