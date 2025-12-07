import { getLetterByIndex } from 'uiSrc/utils'

const getLetterByIndexTests: any[] = [
  [0, 'A'],
  [5, 'F'],
  [25, 'Z'],
  [26, 'AA'],
  [52, 'BA'],
  [522, 'TC'],
  [1024, 'AMK'],
]

describe('getLetterByIndex', () => {
  it.each(getLetterByIndexTests)(
    'for input: %s (index), should be output: %s',
    (index, expected) => {
      expect(getLetterByIndex(index)).toBe(expected)
    },
  )
})
