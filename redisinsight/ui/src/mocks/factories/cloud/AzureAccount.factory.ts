import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { AzureAccount } from 'uiSrc/slices/oauth/azure'

export const AzureAccountFactory = Factory.define<AzureAccount>(() => ({
  id: faker.string.uuid(),
  username: faker.internet.email(),
  name: faker.person.fullName(),
}))
