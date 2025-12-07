import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { RedisCloudAccount } from 'uiSrc/slices/interfaces'

export const RedisCloudAccountFactory = Factory.define<RedisCloudAccount>(
  () => ({
    accountId: faker.number.int({ min: 100000, max: 999999 }),
    accountName: faker.person.fullName(),
    ownerName:
      faker.helpers.maybe(() => faker.company.name(), { probability: 0.7 }) ??
      null,
    ownerEmail: faker.internet.email(),
  }),
)
