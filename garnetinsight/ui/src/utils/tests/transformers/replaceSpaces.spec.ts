import { replaceSpaces } from 'uiSrc/utils'

const getReplaceSpacesTests: any[] = [
  ['10', '10'],
  [' trala la ', ' trala la '],
  [
    'tr    la    lo lu',
    'tr\u00a0\u00a0\u00a0\u00a0la\u00a0\u00a0\u00a0\u00a0lo lu',
  ],
  ['tralalala', 'tralalala'],
  [
    '       1233 123123  tral lalal ',
    '\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0 1233 123123\u00a0\u00a0tral lalal ',
  ],
  [11, '11'],
]

describe('replaceSpaces', () => {
  it.each(getReplaceSpacesTests)(
    'for input: %s (reply), should be output: %s',
    (reply, expected) => {
      const result = replaceSpaces(reply)
      expect(result).toBe(expected)
    },
  )
})
