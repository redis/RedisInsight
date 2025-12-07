import { formatBytes, toBytes } from 'uiSrc/utils'

const formatBytesTests: any[] = [
  [256, 3, '256 B'],
  [256, undefined, '256 B'],
  [0, undefined, '0 B'],
  [1024, undefined, '1 KB'],
  [1200, undefined, '1.172 KB'],
  [14758, 0, '14 KB'],
  [14758, 3, '14.412 KB'],
  [1048576, undefined, '1 MB'],
  [1572864, undefined, '1.5 MB'],
  [1572864, 0, '2 MB'],
  [1572864, -1, '2 MB'],
  [1347545989, 0, '1 GB'],
  [1347545989, 3, '1.255 GB'],
  [36538736640, 0, '34 GB'],
  [1099511627776, undefined, '1 TB'],
  [1649267441664, undefined, '1.5 TB'],
  [1649267441664, 0, '2 TB'],
  [1379887092858, 3, '1.255 TB'],
  [1379887092858, undefined, '1.255 TB'],
  [1379887092858, 1, '1.3 TB'],
  [1125899906842624, undefined, '1 PB'],
  [1125899906842624, 3, '1 PB'],
  [1413004383087493, 3, '1.255 PB'],
  [1413004383087493, 1, '1.3 PB'],
  [1152921504606847000, undefined, '1 EB'],
  [1152921504606847000, 3, '1 EB'],
  [1446916488281592800, 3, '1.255 EB'],
  [1446916488281592800, 1, '1.3 EB'],
  [1.1805916207174113e21, 0, '1 ZB'],
  [1.2089258196146292e24, 0, '1 YB'],
  [1.2379400392853803e27, 0, '1024 YB'],
  ['1', 0, '1 B'],
  ['string', 0, '-'],
  [-100, 0, '-'],
]

describe('formatBytes', () => {
  it.each(formatBytesTests)(
    'for input: %s (bytes), %s (decimals), should be output: %s',
    (bytes, decimals, expected) => {
      const result = formatBytes(bytes, decimals)
      expect(result).toBe(expected)
    },
  )
  it('should return proper array with splitResults', () => {
    expect(formatBytes(1572864, 0, true)).toEqual([2, 'MB'])
    expect(formatBytes(1347545989, 3, true)).toEqual([1.255, 'GB'])
    expect(formatBytes(0, 3, true)).toEqual([0, 'B'])
  })

  it('should properly set the baseK', () => {
    expect(formatBytes(1347545989, 3, true)).toEqual([1.255, 'GB']) // default uses 1024
    expect(formatBytes(1347545989, 3, true, 1000)).toEqual([1.348, 'GB'])
  })
})

const toBytesTests: any[] = [
  [256, '256 B'],
  [256, '256 B'],
  [0, '0 B'],
  [1024, '1 KB'],
  [1048576, '1 MB'],
  [1572864, '1.5 MB'],
  [1099511627776, '1 TB'],
  [1649267441664, '1.5 TB'],
  [1379887092858, '1.255 TB'],
  [1125899906842624, '1 PB'],
  [1125899906842624, '1 PB'],
  [1413004383087493, '1.255 PB'],
  [1152921504606847000, '1 EB'],
  [1152921504606847000, '1 EB'],
  [1446916488281592800, '1.255 EB'],
  [1.1805916207174113e21, '1 ZB'],
  [1.2089258196146292e24, '1 YB'],
  [1.2379400392853803e27, '1024 YB'],
]

describe('toBytes', () => {
  it.each(toBytesTests)(
    'should be output: %s, for value: $s',
    (expected, formatted) => {
      const [bytes, type] = formatted.split(' ')

      const result = toBytes(+bytes, type)
      expect(result).toBe(expected)
    },
  )
})
