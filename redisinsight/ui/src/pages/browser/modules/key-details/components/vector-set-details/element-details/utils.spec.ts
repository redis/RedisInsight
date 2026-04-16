import { formatVector } from './utils'

describe('formatVector', () => {
  it('should return "[]" for undefined vector', () => {
    expect(formatVector(undefined)).toBe('[]')
  })

  it('should return "[]" for empty vector', () => {
    expect(formatVector([])).toBe('[]')
  })

  it('should format vector without truncation indicator', () => {
    expect(formatVector([1, 2.5, 3])).toBe('[1, 2.5, 3]')
  })

  it('should not append "..." when truncated is false', () => {
    expect(formatVector([1, 2, 3], false)).toBe('[1, 2, 3]')
  })

  it('should append "..." when truncated is true', () => {
    expect(formatVector([1, 2, 3], true)).toBe('[1, 2, 3, ...]')
  })

  it('should not append "..." when truncated is undefined', () => {
    const vector = Array.from({ length: 10 }, (_, i) => i)
    expect(formatVector(vector)).toBe(`[${vector.join(', ')}]`)
  })
})
