import { getTreeLeafField } from 'uiSrc/utils'

const getTreeLeafFieldTests: any[] = [
  [':', 'keys:keys'],
  [';', 'keys;keys'],
  ['123', 'keys123keys'],
  ['   ', 'keys   keys'],
  ['_', 'keys_keys'],
  ['abc', 'keysabckeys'],
  ['$$$', 'keys$$$keys'],
  ['-', 'keys-keys'],
]

describe('getTreeLeafField', () => {
  it.each(getTreeLeafFieldTests)(
    'for input: %s (reply), should be output: %s',
    (reply, expected) => {
      const result = getTreeLeafField(reply)
      expect(result).toBe(expected)
    },
  )
})
