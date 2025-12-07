import { getTruncatedName } from 'uiSrc/utils'

const getTruncatedNameTests: any[] = [
  ['Bill Russell', 'BR'],
  ['Bill Russell Van Der', 'BR'],
  ['Bill', 'B'],
  ['', ''],
  [null, ''],
  [undefined, ''],
]

describe('getTruncatedName', () => {
  it.each(getTruncatedNameTests)(
    'should be output: %s, for value: $s',
    (input, output) => {
      expect(getTruncatedName(input)).toBe(output)
    },
  )
})
