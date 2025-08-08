import { dataPointsTimestamps, hexToRGBA } from './utils'

const hexToRGBATests: [string, string][] = [
  ['#fbafff', 'rgb(251, 175, 255)'],
  ['#af087b', 'rgb(175, 8, 123)'],
  ['#0088ff', 'rgb(0, 136, 255)'],
  ['#123456', 'rgb(18, 52, 86)'],
  ['#FF0000', 'rgb(255, 0, 0)'],
  ['#345465', 'rgb(52, 84, 101)'],
]

describe('hexToRGBA', () => {
  it.each(hexToRGBATests)(
    'for input hex: %s, should be output: %s',
    (hex, expected) => {
      const result = hexToRGBA(hex, 0)
      expect(result).toBe(expected)
    },
  )
})
const dataPointsTimestampsTests: [[number, string][], [number, string][]][] = [
  // Timestamp in seconds -> converted to ms
  [[[1690000000, 'point A']], [[1690000000 * 1000, 'point A']]],
  // Timestamp already in milliseconds -> unchanged
  [[[1690000000000, 'point B']], [[1690000000000, 'point B']]],
  // Mixed case: some in seconds, some in milliseconds
  [
    [
      [1690000000, 'A'],
      [1690000000000, 'B'],
    ],
    [
      [1690000000 * 1000, 'A'],
      [1690000000000, 'B'],
    ],
  ],
  // Edge case: exactly 10^10 should not be converted (treated as ms)
  [[[1e10, 'boundary']], [[1e10, 'boundary']]],
]

describe('dataPointsTimestamps', () => {
  it.each(dataPointsTimestampsTests)(
    'should normalize timestamps for input: %j',
    (input, expected) => {
      const result = dataPointsTimestamps(input)
      expect(result).toEqual(expected)
    },
  )
})
