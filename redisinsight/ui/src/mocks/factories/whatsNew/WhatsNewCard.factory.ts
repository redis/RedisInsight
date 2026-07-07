import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import {
  WhatsNewCard,
  WhatsNewVersion,
  WhatsNewVersionType,
} from 'uiSrc/constants/content/whatsNew.types'

export const whatsNewCardFactory = Factory.define<WhatsNewCard>(() => ({
  id: faker.lorem.slug(2),
  title: faker.lorem.words(3),
  body: faker.lorem.sentence(),
}))

export const whatsNewVersionFactory = Factory.define<WhatsNewVersion>(() => ({
  version: faker.system.semver(),
  releaseDate: faker.date.past().toISOString().slice(0, 10),
  type: WhatsNewVersionType.Minor,
  cards: whatsNewCardFactory.buildList(3),
}))
