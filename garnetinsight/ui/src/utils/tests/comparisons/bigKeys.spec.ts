import { KeyTypes } from 'uiSrc/constants'
import { HighlightType, isBigKey } from 'uiSrc/utils'

const isBigKeyTests: any[] = [
  [KeyTypes.Hash, HighlightType.Memory, 100, false],
  [KeyTypes.Hash, HighlightType.Memory, 5_000_000, true],
  [KeyTypes.Hash, HighlightType.Length, 50_000_000, true],
  [KeyTypes.String, HighlightType.Memory, 50_000_000, true],
  [KeyTypes.String, HighlightType.Length, 50_000_000, false],
  [KeyTypes.Stream, HighlightType.Memory, 50_000_000, true],
  [KeyTypes.Stream, HighlightType.Length, 50_000_000, false],
  [KeyTypes.Stream, HighlightType.Memory, 199, false],
  ['newType', HighlightType.Memory, 98391283123123, true],
  ['newType', HighlightType.Length, 98391283123123, false],
]

describe('isBigKey', () => {
  it.each(isBigKeyTests)(
    'for input: %s (keyType), %s (type), %s (count) should be output: %s',
    (keyType, type, count, expected) => {
      const result = isBigKey(keyType, type, count)
      expect(result).toBe(expected)
    },
  )
})
