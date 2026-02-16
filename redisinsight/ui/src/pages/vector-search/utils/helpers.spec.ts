import { formatPrefixes } from './helpers'

describe('formatPrefixes', () => {
  it('should format single prefix with quotes', () => {
    expect(formatPrefixes(['user:'])).toBe('"user:"')
  })

  it('should format multiple prefixes with comma separator', () => {
    expect(formatPrefixes(['user:', 'customer:'])).toBe('"user:", "customer:"')
  })

  it('should return empty string for undefined', () => {
    expect(formatPrefixes(undefined)).toBe('')
  })

  it('should return empty string for empty array', () => {
    expect(formatPrefixes([])).toBe('')
  })
})
