import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import {
  AddRedisDatabaseStatus,
  InstanceRedisCluster,
  InstanceRedisClusterStatus,
  RedisDefaultModules,
} from 'uiSrc/slices/interfaces'

export const RedisClusterInstanceFactory = Factory.define<InstanceRedisCluster>(
  () => {
    const host = faker.internet.ip()
    const port = faker.number.int({ min: 6379, max: 65535 })
    const uid = faker.number.int({ min: 1, max: 999999 })
    const dnsName = `redis-${faker.number.int({ min: 1000, max: 99999 })}.cluster.local`

    // Pick a random unique subset of modules
    const allModules = Object.values(RedisDefaultModules)
    const randomModules = faker.helpers.arrayElements(
      allModules,
      faker.number.int({ min: 0, max: Math.min(3, allModules.length) }),
    ) as RedisDefaultModules[]
    const modules = Array.from(new Set(randomModules)) as RedisDefaultModules[]

    return {
      host,
      port,
      uid,
      name: `redis-db-${faker.number.int({ min: 1, max: 999 })}`,
      id: faker.number.int({ min: 1, max: 999999 }),
      dnsName,
      address: `${host}:${port}`,
      status: faker.helpers.arrayElement([
        InstanceRedisClusterStatus.Active,
        InstanceRedisClusterStatus.Pending,
        InstanceRedisClusterStatus.CreationFailed,
      ]),
      modules,
      tls: faker.datatype.boolean(),
      options: {},
      message: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
      uidAdded: undefined,
      statusAdded: undefined,
      messageAdded: undefined,
      databaseDetails: undefined,
    }
  },
)

export const RedisClusterInstanceAddedFactory = RedisClusterInstanceFactory.afterBuild(
  (instance) => {
    const statusAdded = faker.helpers.arrayElement([
      AddRedisDatabaseStatus.Success,
      AddRedisDatabaseStatus.Fail,
    ])
    
    return {
      ...instance,
      uidAdded: faker.number.int({ min: 1, max: 999999 }),
      statusAdded,
      messageAdded:
        statusAdded === AddRedisDatabaseStatus.Success
          ? 'Successfully added'
          : faker.lorem.sentence(),
    }
  },
)
