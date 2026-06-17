import { faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { KeyTypes } from 'uiSrc/constants'
import { stringToBuffer } from 'uiSrc/utils'
import { IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'
import { ArrayDataElement } from 'uiSrc/slices/interfaces/array'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

/** Random shared array key buffer name (stable per import). */
export const mockArrayKeyBuffer = stringToBuffer(
  `arr:${faker.string.alphanumeric(10)}`,
)

/**
 * `ArrayDataElement` factory. `index` follows the fishery sequence as a
 * decimal string so consecutive `.build()` calls produce '0', '1', '2'… —
 * pin specific positions (BigInt-as-string boundary, sparse gaps, etc.)
 * via `.build({ index })` overrides. Defaults to an empty slot since most
 * tests assert gap rendering; use `arrayElementWithValueFactory` when you
 * need a populated value.
 */
export const arrayElementFactory = Factory.define<ArrayDataElement>(
  ({ sequence }) => ({
    index: String(sequence - 1),
    value: null,
  }),
)

/** Variant that fills the slot with a buffered random string. */
export const arrayElementWithValueFactory = Factory.define<ArrayDataElement>(
  ({ sequence }) => ({
    index: String(sequence - 1),
    value: stringToBuffer(faker.word.noun()) as unknown as RedisResponseBuffer,
  }),
)

/**
 * Selected-key info shape used by the key-details header when an Array key
 * is open. Mirrors `GetArrayKeyInfoResponse`: `length` and `count` are
 * decimal strings since u64 indexes exceed `Number.MAX_SAFE_INTEGER`.
 * Returned as `Partial<IKeyPropTypes>` so tests only need to override the
 * fields they assert on.
 */
export const selectedArrayKeyInfoFactory = Factory.define<
  Partial<IKeyPropTypes>
>(() => ({
  type: KeyTypes.Array,
  size: faker.number.int({ min: 1, max: 4096 }),
  length: faker.number.int({ min: 1, max: 1000 }),
  count: String(faker.number.int({ min: 0, max: 1000 })),
}))
