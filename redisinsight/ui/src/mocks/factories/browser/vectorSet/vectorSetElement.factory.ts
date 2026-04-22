import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { KeyTypes } from 'uiSrc/constants'
import { stringToBuffer } from 'uiSrc/utils'
import {
  AddVectorSetElementsData,
  VectorSetElement,
} from 'uiSrc/slices/interfaces'

export const mockKeyBuffer = stringToBuffer(faker.word.noun())

export const mockVectorSetKeyInfo = {
  name: mockKeyBuffer,
  type: KeyTypes.VectorSet,
  ttl: faker.number.int({ min: -1, max: 86400 }),
  size: faker.number.int({ min: 1, max: 1000 }),
}

export const mockVectorSetElementAttributes = (): string =>
  JSON.stringify({ [faker.word.noun()]: faker.word.adjective() })

const buildBaseElement = (): Omit<VectorSetElement, 'attributes'> => ({
  name: stringToBuffer(faker.word.words({ count: { min: 1, max: 3 } })),
  vector: faker.helpers.arrayElements(
    Array.from({ length: 128 }, () =>
      faker.number.float({ min: -1, max: 1, fractionDigits: 6 }),
    ),
    faker.number.int({ min: 2, max: 8 }),
  ),
})

export const vectorSetElementFactory = Factory.define<VectorSetElement>(() => ({
  ...buildBaseElement(),
}))

export const vectorSetElementWithAttributesFactory =
  Factory.define<VectorSetElement>(() => ({
    ...buildBaseElement(),
    attributes: mockVectorSetElementAttributes(),
  }))

const buildMockVector = (dim = 3): number[] =>
  Array.from({ length: dim }, () =>
    faker.number.float({ min: -1, max: 1, fractionDigits: 6 }),
  )

export const addVectorSetElementsDataFactory =
  Factory.define<AddVectorSetElementsData>(() => ({
    keyName: stringToBuffer(`vset:${faker.string.alphanumeric(10)}`),
    elements: [
      { name: faker.word.noun(), vector: buildMockVector() },
      {
        name: faker.word.noun(),
        vector: buildMockVector(),
        attributes: mockVectorSetElementAttributes(),
      },
    ],
  }))

/** Redis key name string for vector set tests (stable shape, random value). */
export const vectorSetTestKeyName = (): string =>
  `vset:${faker.string.alphanumeric(10)}`

/**
 * Cursor for the next page of vector set elements: exclusive lexicographic
 * start after the last returned element name (matches API `(${lastElementName}`).
 */
export const vectorSetPaginationCursorAfter = (
  element: VectorSetElement,
): string => `(${element.name.toString()}`
