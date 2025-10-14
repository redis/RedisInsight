import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { KeyValueFormat } from 'uiSrc/constants/keys'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'

export const dbConnectionInfoFactory = Factory.define<DbConnectionInfo>(() => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
  host: faker.internet.ip(),
  port: faker.internet.port().toString(),
  username: faker.internet.userName(),
  password: faker.internet.password(),
  timeout: faker.number.int({ min: 10, max: 120 }).toString(),
  selectedCaCertName: 'none',
  keyNameFormat: KeyValueFormat,
  modules: [],
  version: faker.system.semver(),
}))
