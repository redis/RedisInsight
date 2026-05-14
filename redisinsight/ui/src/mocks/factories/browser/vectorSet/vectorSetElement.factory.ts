import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { KeyTypes } from 'uiSrc/constants'
import { stringToBuffer } from 'uiSrc/utils'
import {
  AddVectorSetElementsData,
  VectorSetElement,
  VectorSetSimilarityMatch,
} from 'uiSrc/slices/interfaces'
import { IVectorSetElementState } from 'uiSrc/pages/browser/modules/key-details/components/vector-set-details/vector-set-element-form/interfaces'

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

/**
 * Builds a `VectorSetSimilarityMatch` with a buffered random name and a
 * `[0, 1]` score. Pass `attributes` via overrides when the test needs them.
 */
export const vectorSetSimilarityMatchFactory =
  Factory.define<VectorSetSimilarityMatch>(() => ({
    name: stringToBuffer(faker.word.noun()),
    score: faker.number.float({ min: 0, max: 1, fractionDigits: 4 }),
  }))

const buildMockVector = (dim = 3): number[] =>
  Array.from({ length: dim }, () =>
    faker.number.float({ min: -1, max: 1, fractionDigits: 6 }),
  )

export const addVectorSetElementsDataFactory =
  Factory.define<AddVectorSetElementsData>(() => ({
    keyName: stringToBuffer(`vset:${faker.string.alphanumeric(10)}`),
    elements: [
      { name: faker.word.noun(), vectorValues: buildMockVector() },
      {
        name: faker.word.noun(),
        vectorValues: buildMockVector(),
        attributes: mockVectorSetElementAttributes(),
      },
    ],
  }))

export const vectorSetElementFormStateFactory =
  Factory.define<IVectorSetElementState>(() => ({
    id: 1,
    name: 'item',
    vector: '1, 2, 3',
    attributes: '',
    showAttributes: false,
  }))

/**
 * Shared FP32 fixture used across vector-set unit tests. Represents the vector
 * `[1.0, 2.0, 3.0]` as a 12-byte little-endian IEEE-754 blob, together with
 * its two wire representations: the C/Python-style escaped string that the
 * form accepts as input, and the base64 string that the BE DTO receives.
 *
 * 1.0 -> 00 00 80 3f, 2.0 -> 00 00 00 40, 3.0 -> 00 00 40 40
 */
export const FP32_VECTOR_FIXTURE_1_2_3 = (() => {
  const bytes = [
    0x00, 0x00, 0x80, 0x3f, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x40, 0x40,
  ]
  const escaped = bytes
    .map((b) => `\\x${b.toString(16).padStart(2, '0')}`)
    .join('')
  const base64 = btoa(String.fromCharCode(...bytes))
  return { bytes, escaped, base64, dim: bytes.length / 4 }
})()

/**
 * 3-byte FP32 input used by negative tests. Starts with `\x` (so detection
 * commits to the FP32 branch) but fails the "byte length must be a multiple
 * of 4" check, exercising the format-specific error path.
 */
export const FP32_INVALID_BYTE_LENGTH_INPUT = '\\x00\\x00\\x00'

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
