import { isMaxColumnFieldValue } from './isMaxColumnFieldValue'

interface TestNode {
  id: string
  value: number
  otherValue: number
}

describe('isMaxColumnFieldValue', () => {
  it('should return true when value is the maximum and unique', () => {
    const data: TestNode[] = [
      { id: '1', value: 10, otherValue: 5 },
      { id: '2', value: 20, otherValue: 15 },
      { id: '3', value: 5, otherValue: 25 },
    ]

    expect(isMaxColumnFieldValue('value', 20, data)).toBe(true)
  })

  it('should return false when value is not the maximum', () => {
    const data: TestNode[] = [
      { id: '1', value: 10, otherValue: 5 },
      { id: '2', value: 20, otherValue: 15 },
      { id: '3', value: 5, otherValue: 25 },
    ]

    expect(isMaxColumnFieldValue('value', 10, data)).toBe(false)
    expect(isMaxColumnFieldValue('value', 5, data)).toBe(false)
  })

  it('should return false when there is a tie (multiple nodes with max value)', () => {
    const data: TestNode[] = [
      { id: '1', value: 20, otherValue: 5 },
      { id: '2', value: 20, otherValue: 15 },
      { id: '3', value: 5, otherValue: 25 },
    ]

    expect(isMaxColumnFieldValue('value', 20, data)).toBe(false)
  })

  it('should return true when all other values are lower', () => {
    const data: TestNode[] = [
      { id: '1', value: 100, otherValue: 5 },
      { id: '2', value: 50, otherValue: 15 },
      { id: '3', value: 25, otherValue: 25 },
      { id: '4', value: 10, otherValue: 30 },
    ]

    expect(isMaxColumnFieldValue('value', 100, data)).toBe(true)
  })

  it('should handle zero values correctly', () => {
    const data: TestNode[] = [
      { id: '1', value: 0, otherValue: 5 },
      { id: '2', value: 10, otherValue: 15 },
      { id: '3', value: 5, otherValue: 25 },
    ]

    expect(isMaxColumnFieldValue('value', 10, data)).toBe(true)
    expect(isMaxColumnFieldValue('value', 0, data)).toBe(false)
  })

  it('should return false when all values are zero', () => {
    const data: TestNode[] = [
      { id: '1', value: 0, otherValue: 5 },
      { id: '2', value: 0, otherValue: 15 },
      { id: '3', value: 0, otherValue: 25 },
    ]

    expect(isMaxColumnFieldValue('value', 0, data)).toBe(false)
  })

  it('should return true when there is only one node', () => {
    const data: TestNode[] = [{ id: '1', value: 10, otherValue: 5 }]

    expect(isMaxColumnFieldValue('value', 10, data)).toBe(true)
  })

  it('should handle empty data array', () => {
    const data: TestNode[] = []

    expect(isMaxColumnFieldValue('value', 10, data)).toBe(false)
  })

  it('should handle negative values', () => {
    const data: TestNode[] = [
      { id: '1', value: -10, otherValue: 5 },
      { id: '2', value: -5, otherValue: 15 },
      { id: '3', value: -20, otherValue: 25 },
    ]

    expect(isMaxColumnFieldValue('value', -5, data)).toBe(true)
    expect(isMaxColumnFieldValue('value', -10, data)).toBe(false)
  })

  it('should handle large numbers', () => {
    const data: TestNode[] = [
      { id: '1', value: 1000000, otherValue: 5 },
      { id: '2', value: 999999, otherValue: 15 },
      { id: '3', value: 500000, otherValue: 25 },
    ]

    expect(isMaxColumnFieldValue('value', 1000000, data)).toBe(true)
  })

  it('should work with different field names', () => {
    const data: TestNode[] = [
      { id: '1', value: 10, otherValue: 5 },
      { id: '2', value: 20, otherValue: 15 },
      { id: '3', value: 5, otherValue: 25 },
    ]

    expect(isMaxColumnFieldValue('otherValue', 25, data)).toBe(true)
    expect(isMaxColumnFieldValue('otherValue', 15, data)).toBe(false)
  })

  it('should return false when value does not exist in data', () => {
    const data: TestNode[] = [
      { id: '1', value: 10, otherValue: 5 },
      { id: '2', value: 20, otherValue: 15 },
      { id: '3', value: 5, otherValue: 25 },
    ]

    expect(isMaxColumnFieldValue('value', 100, data)).toBe(false)
  })

  it('should handle three-way tie', () => {
    const data: TestNode[] = [
      { id: '1', value: 10, otherValue: 5 },
      { id: '2', value: 10, otherValue: 15 },
      { id: '3', value: 10, otherValue: 25 },
    ]

    expect(isMaxColumnFieldValue('value', 10, data)).toBe(false)
  })

  it('should handle decimal values', () => {
    const data: TestNode[] = [
      { id: '1', value: 10.5, otherValue: 5 },
      { id: '2', value: 10.7, otherValue: 15 },
      { id: '3', value: 10.3, otherValue: 25 },
    ]

    expect(isMaxColumnFieldValue('value', 10.7, data)).toBe(true)
    expect(isMaxColumnFieldValue('value', 10.5, data)).toBe(false)
  })
})

