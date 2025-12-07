import { isBigInt, isArray, isObject } from './utils'

const isBigIntTests = [
  ['', false],
  [true, false],
  [false, false],
  [0, false],
  ['123', false],
  [123, false],
  [[], false],
  [[123], false],
  [{}, false],
  [{ name: 'something' }, false],
  [BigInt(1), true],
  [Infinity, false],
  [NaN, false],
]

const isArrayTests = [
  ['', false],
  [true, false],
  [false, false],
  [0, false],
  ['123', false],
  [123, false],
  [[], true],
  [[123], true],
  [{}, false],
  [{ name: 'something' }, false],
  [BigInt(1), false],
  [Infinity, false],
  [NaN, false],
]

const isObjectTests = [
  ['', false],
  [true, false],
  [false, false],
  [0, false],
  ['123', false],
  [123, false],
  [[], false],
  [[123], false],
  [{}, true],
  [{ name: 'something' }, true],
  [BigInt(1), false],
  [Infinity, false],
  [NaN, false],
]

describe('isBigInt', () => {
  it.each(isBigIntTests)(
    'for input: %s (name), should be output: %s',
    (value, expected) => {
      const result = isBigInt(value)
      expect(result).toBe(expected)
    },
  )
})

describe('isArray', () => {
  it.each(isArrayTests)(
    'for input: %s (name), should be output: %s',
    (value, expected) => {
      const result = isArray(value)
      expect(result).toBe(expected)
    },
  )
})

describe('isObject', () => {
  it.each(isObjectTests)(
    'for input: %s (name), should be output: %s',
    (value, expected) => {
      const result = isObject(value)
      expect(result).toBe(expected)
    },
  )
})
