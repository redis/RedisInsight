import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import {
  AddRedisDatabaseStatus,
  ModifiedSentinelMaster,
} from 'uiSrc/slices/interfaces'

export const SentinelMasterFactory = Factory.define<ModifiedSentinelMaster>(
  () => {
    const name = `mymaster${faker.number.int({ min: 1, max: 999 })}`
    const host = faker.internet.ip()
    const port = faker.number.int({ min: 6379, max: 65535 }).toString()

    return {
      id: faker.string.uuid(),
      name,
      alias: name,
      host,
      port,
      username: faker.datatype.boolean() ? faker.internet.userName() : '',
      password: faker.datatype.boolean() ? faker.internet.password() : '',
      db: faker.number.int({ min: 0, max: 15 }),
      numberOfSlaves: faker.number.int({ min: 0, max: 5 }),
      status: faker.helpers.arrayElement([
        AddRedisDatabaseStatus.Success,
        AddRedisDatabaseStatus.Fail,
      ]),
      message: faker.datatype.boolean() ? faker.lorem.sentence() : '',
      loading: false,
    }
  },
)
