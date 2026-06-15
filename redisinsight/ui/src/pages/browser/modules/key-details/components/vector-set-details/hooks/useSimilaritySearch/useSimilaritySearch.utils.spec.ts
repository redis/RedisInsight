import { stringToBuffer } from 'uiSrc/utils'

import { areKeysEqual } from './useSimilaritySearch.utils'

describe('areKeysEqual', () => {
  it('returns true when both sides are the same reference', () => {
    const buf = stringToBuffer('mykey')
    expect(areKeysEqual(buf, buf)).toBe(true)
  })

  it('returns true for two distinct buffers with the same byte contents', () => {
    expect(areKeysEqual(stringToBuffer('mykey'), stringToBuffer('mykey'))).toBe(
      true,
    )
  })

  it('returns false for two buffers with different contents', () => {
    expect(areKeysEqual(stringToBuffer('foo'), stringToBuffer('bar'))).toBe(
      false,
    )
  })

  it('returns false for buffers of different lengths sharing a prefix', () => {
    expect(
      areKeysEqual(stringToBuffer('mykey'), stringToBuffer('mykeys')),
    ).toBe(false)
  })

  it('returns true when both sides are undefined', () => {
    expect(areKeysEqual(undefined, undefined)).toBe(true)
  })

  it('returns true when both sides are null', () => {
    expect(areKeysEqual(null, null)).toBe(true)
  })

  it('returns false when only one side is null/undefined', () => {
    const buf = stringToBuffer('mykey')
    expect(areKeysEqual(buf, undefined)).toBe(false)
    expect(areKeysEqual(undefined, buf)).toBe(false)
    expect(areKeysEqual(buf, null)).toBe(false)
    expect(areKeysEqual(null, buf)).toBe(false)
  })

  it('treats null and undefined as not equal to each other', () => {
    expect(areKeysEqual(null, undefined)).toBe(false)
    expect(areKeysEqual(undefined, null)).toBe(false)
  })
})
