import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { ConnectionType, Instance } from 'uiSrc/slices/interfaces'

export const DBInstanceFactory = Factory.define<Instance>(() => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
  host: faker.internet.ip(),
  port: faker.internet.port(),
  username: faker.internet.userName(),
  password: faker.internet.password(),
  visible: faker.datatype.boolean(),
  connectionType: faker.helpers.arrayElement([
    ConnectionType.Standalone,
    ConnectionType.Cluster,
    ConnectionType.Sentinel,
  ]),
  nameFromProvider: faker.company.name(),
  modules: [],
  version: faker.system.semver(),
  lastConnection: faker.date.past(),
  provider: faker.company.name(),
}))
