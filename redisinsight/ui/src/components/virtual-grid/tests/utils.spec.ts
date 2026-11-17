import { getColumnWidth, getExpandedRowHeight } from '../utils'

const getColumnWidthTests: any[] = [
  [0, 500, [{ maxWidth: 70, minWidth: 50 }], 50],
  [
    1,
    500,
    [
      { maxWidth: 70, minWidth: 50 },
      { maxWidth: 170, minWidth: 20 },
    ],
    20,
  ],
  [
    0,
    500,
    [
      { maxWidth: 470, minWidth: 450 },
      { maxWidth: 170, minWidth: 20 },
    ],
    450,
  ],
]

const minColumnWidth = 10

describe('getColumnWidth', () => {
  it.each(getColumnWidthTests)(
    'for input: %s (i), %s (width), %s (columns) should be output: %s',
    (i, width, columns, expected) => {
      const result = getColumnWidth(i, width, columns, minColumnWidth)
      expect(result).toBe(expected)
    },
  )
})

describe('getExpandedRowHeight (RI-8349)', () => {
  const DEFAULT = 43

  it('returns the default height for a non-expanded row', () => {
    expect(getExpandedRowHeight(0, [], { 0: { 0: 100 } }, DEFAULT)).toBe(
      DEFAULT,
    )
  })

  it('returns the tallest recorded column height for an expanded row', () => {
    expect(
      getExpandedRowHeight(1, [1], { 1: { 0: 80, 1: 120, 2: 50 } }, DEFAULT),
    ).toBe(120)
  })

  it('falls back to the default when an expanded row has no recorded height (no crash)', () => {
    // Row flagged expanded before setRowHeight ran — previously threw
    // "Cannot convert undefined or null to object" on Object.values(undefined).
    expect(() => getExpandedRowHeight(2, [2], {}, DEFAULT)).not.toThrow()
    expect(getExpandedRowHeight(2, [2], {}, DEFAULT)).toBe(DEFAULT)
  })

  it('falls back to the default when the recorded height map is empty', () => {
    // Guards Math.max() with no args returning -Infinity.
    expect(getExpandedRowHeight(3, [3], { 3: {} }, DEFAULT)).toBe(DEFAULT)
  })
})
