import { getColumnWidth } from '../utils'

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
