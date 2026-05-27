import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import { stringToBuffer } from 'uiSrc/utils'
import { ArrayElement } from 'uiSrc/slices/interfaces'
import { AddArrayElementsData } from 'uiSrc/slices/interfaces/array'

export const arrayTestKeyName = () => stringToBuffer(faker.word.noun())

export const arrayElementFactory = Factory.define<ArrayElement>(
  ({ sequence }) => ({
    index: sequence - 1,
    value: stringToBuffer(faker.word.words({ count: { min: 1, max: 3 } })),
  }),
)

export const addArrayElementsDataFactory = Factory.define<AddArrayElementsData>(
  () => ({
    keyName: arrayTestKeyName(),
    elements: [
      {
        index: faker.number.int({ min: 0, max: 100 }),
        value: faker.word.words(),
      },
    ],
  }),
)
