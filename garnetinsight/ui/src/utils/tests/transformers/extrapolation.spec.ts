import { extrapolate, formatExtrapolation, Maybe } from 'uiSrc/utils'

const extrapolationTests: Array<
  [
    number,
    {
      apply: boolean
      extrapolation?: number | undefined
      showPrefix?: boolean | undefined
    },
    Maybe<(val: number) => string | number>,
    string | number,
  ]
> = [
  [500, { apply: true, extrapolation: 2 }, undefined, '~1000'],
  [270, { apply: true, extrapolation: 2.33 }, Math.round, '~629'],
  [100.125, { apply: false, extrapolation: 2.33 }, Math.round, 100],
  [
    100.125,
    { apply: true, extrapolation: 2.5, showPrefix: false },
    Math.round,
    250,
  ],
]

describe('extrapolation', () => {
  it.each(extrapolationTests)(
    'for input: %s (value), %s (options), %s (callback) should be output: %s',
    (value, options, callback, expected) => {
      const result = extrapolate(value, options, callback)
      expect(result).toBe(expected)
    },
  )
})

describe('formatExtrapolation', () => {
  it('should properly return value', () => {
    expect(formatExtrapolation(112)).toBe('~112')
    expect(formatExtrapolation(112, false)).toBe(112)
  })
})
