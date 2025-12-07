import {
  getColumnWidth,
  findColumn,
  hideColumn,
  MIN_COLUMN_WIDTH,
} from './utils'

const getColumnWidthTests: any[] = [
  ['10px', 10],
  ['350px', 350],
  ['100', MIN_COLUMN_WIDTH],
  ['x', MIN_COLUMN_WIDTH],
]

describe('getColumnWidth', () => {
  it.each(getColumnWidthTests)(
    'for input: %s (input), should be output: %s',
    (input, expected) => {
      const result = getColumnWidth(input)
      expect(result).toBe(expected)
    },
  )
})

const findColumnTests: any[] = [
  [[[{ field: '1' }, { field: '2' }], '1'], { field: '1' }],
  [[[{ field: '1' }, { field: '2' }], '3'], undefined],
]

describe('findColumn', () => {
  it.each(findColumnTests)(
    'for input: %s (input), should be output: %s',
    (input, expected) => {
      const result = findColumn(...(input as [any, string]))
      expect(result).toEqual(expected)
    },
  )
})

const hideColumnTests: any[] = [
  [{ field: '1' }, { field: '1', width: '0px', className: 'hiddenColumn' }],
]

describe('hideColumn', () => {
  it.each(hideColumnTests)(
    'for input: %s (input), should be output: %s',
    (input, expected) => {
      const result = hideColumn(input)
      expect(result).toEqual(expected)
    },
  )
})
