import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { RdiInstance } from 'uiSrc/slices/interfaces'

export const rdiInstanceFactory = Factory.define<RdiInstance>(() => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
  url: faker.internet.url(),
  username: faker.internet.userName(),
  password: faker.internet.password(),
  version: faker.system.semver(),
  lastConnection: faker.date.past(),
  error: '',
  loading: false,
}))
