import { getTagFromValue } from 'uiSrc/components/base/forms/combo-box/AutoTag'

const defaultDelimiter = ' '
describe('AutoTag', () => {
  describe('getTagFromValue', () => {
    it('should return null on empty string', () => {
      const result = getTagFromValue('', defaultDelimiter)
      expect(result).toBeNull()
    })
    it.each([
      ['', defaultDelimiter],
      ['a', defaultDelimiter],
      [' ', defaultDelimiter],
      ['abcd', defaultDelimiter],
    ])(
      'should return null on single character string where delimiter is not present: `%s`, `%s`',
      (value, delimiter) => {
        const result = getTagFromValue(value, delimiter)
        expect(result).toBeNull()
      },
    )
    it.each([
      ['a,', ',', 'a'],
      [' ,', ',', ' '],
      ['abcd ', defaultDelimiter, 'abcd'],
      ['abcd dcba', defaultDelimiter, 'abcd'],
    ])(
      'should return correct value on value + delimiter string + whatever: `%s`, `%s` -> `%s`',
      (value, delimiter, expected) => {
        const result = getTagFromValue(value, delimiter)
        expect(result).toEqual(expected)
      },
    )
  })
})
