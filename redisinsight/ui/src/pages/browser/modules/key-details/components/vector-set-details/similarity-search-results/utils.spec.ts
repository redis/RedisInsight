import { formatSimilarity } from './utils'

describe('formatSimilarity', () => {
  it.each([
    [1, '100.00 %'],
    [0.9999, '99.99 %'],
    [0.5, '50.00 %'],
    [0, '0.00 %'],
    [0.123456, '12.35 %'],
    [-0.5, '-50.00 %'],
  ])('formats %p as %p', (input, expected) => {
    expect(formatSimilarity(input)).toBe(expected)
  })

  it('returns a dash for non-finite scores', () => {
    expect(formatSimilarity(Number.NaN)).toBe('—')
    expect(formatSimilarity(Number.POSITIVE_INFINITY)).toBe('—')
    expect(formatSimilarity(Number.NEGATIVE_INFINITY)).toBe('—')
  })
})
