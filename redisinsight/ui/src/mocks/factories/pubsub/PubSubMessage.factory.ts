import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { PubSubMessage } from 'uiSrc/slices/interfaces/pubsub'

const CHANNELS = ['news:tech', 'news:alerts', 'metrics:events', 'system:logs']

export const PubSubMessageFactory = Factory.define<PubSubMessage>(() => ({
  channel: faker.helpers.arrayElement(CHANNELS),
  message: faker.lorem.sentences(faker.number.int({ min: 1, max: 6 })),
  time: faker.date.recent().getTime() / 1000,
}))
