import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { KeyTypes } from 'uiSrc/constants'
import { stringToBuffer } from 'uiSrc/utils'
import { VectorSetElement } from 'uiSrc/slices/interfaces'

export const mockKeyBuffer = stringToBuffer(faker.word.noun())

export const mockVectorSetKeyInfo = {
  name: mockKeyBuffer,
  type: KeyTypes.VectorSet,
  ttl: faker.number.int({ min: -1, max: 86400 }),
  size: faker.number.int({ min: 1, max: 1000 }),
}

export const vectorSetElementFactory = Factory.define<VectorSetElement>(() => ({
  name: stringToBuffer(faker.word.words({ count: { min: 1, max: 3 } })),
  vector: faker.helpers.arrayElements(
    Array.from({ length: 128 }, () =>
      faker.number.float({ min: -1, max: 1, fractionDigits: 6 }),
    ),
    faker.number.int({ min: 2, max: 8 }),
  ),
  attributes: faker.datatype.boolean()
    ? JSON.stringify({ [faker.word.noun()]: faker.word.adjective() })
    : undefined,
}))

export const mockVectorSetElements: VectorSetElement[] =
  vectorSetElementFactory.buildList(3)
