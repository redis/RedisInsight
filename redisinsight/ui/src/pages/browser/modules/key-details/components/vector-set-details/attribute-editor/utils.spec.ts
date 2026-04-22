import { isJsonValid } from './utils'

describe('isJsonValid', () => {
  describe('empty values', () => {
    it.each([
      ['empty string', ''],
      ['whitespace only', '   '],
      ['tabs and newlines', '\t\n  \n'],
    ])('should return true for %s', (_label, input) => {
      expect(isJsonValid(input)).toBe(true)
    })
  })

  describe('valid JSON', () => {
    it.each([
      ['object', '{"status":"ok"}'],
      ['nested object', '{"a":{"b":{"c":1}}}'],
      ['array', '[1, 2, 3]'],
      ['array of objects', '[{"id":1},{"id":2}]'],
      ['string literal', '"hello"'],
      ['number literal', '42'],
      ['boolean literal', 'true'],
      ['null literal', 'null'],
      ['JSON with surrounding whitespace', '  {"a":1}  \n'],
    ])('should return true for %s', (_label, input) => {
      expect(isJsonValid(input)).toBe(true)
    })
  })

  describe('invalid JSON', () => {
    it.each([
      ['plain text', 'not json'],
      ['single-quoted keys', "{'a':1}"],
      ['trailing comma', '{"a":1,}'],
      ['unquoted keys', '{a:1}'],
      ['unclosed object', '{"a":1'],
      ['unclosed array', '[1, 2'],
      ['bare identifier', 'undefined'],
    ])('should return false for %s', (_label, input) => {
      expect(isJsonValid(input)).toBe(false)
    })
  })
})
