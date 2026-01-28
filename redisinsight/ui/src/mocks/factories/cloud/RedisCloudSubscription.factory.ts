import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import {
  RedisCloudSubscription,
  RedisCloudSubscriptionStatus,
  RedisCloudSubscriptionType,
} from 'uiSrc/slices/interfaces'

const PROVIDERS = ['aws', 'google', 'azure'] as const
const REGIONS = [
  'us-east-1',
  'us-west-2',
  'eu-west-1',
  'eu-central-1',
  'ap-southeast-1',
] as const

export const RedisCloudSubscriptionFactory =
  Factory.define<RedisCloudSubscription>(() => {
    const region = faker.helpers.arrayElement([...REGIONS])
    const provider = faker.helpers.arrayElement([...PROVIDERS])

    return {
      id: faker.number.int({ min: 100000, max: 99999999 }),
      name: `${faker.word.noun()}-${faker.number.int({ min: 1000, max: 99999 })}.${region}.cloud`,
      type: faker.helpers.enumValue(RedisCloudSubscriptionType),
      numberOfDatabases: faker.number.int({ min: 0, max: 20 }),
      provider,
      region,
      status: faker.helpers.enumValue(RedisCloudSubscriptionStatus),
      free: faker.datatype.boolean(),
    }
  })
