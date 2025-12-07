import {
  generatePath,
  getBrackets,
  isRealArray,
  isRealObject,
  isScalar,
  isValidKey,
  parseJsonData,
  parseValue,
  stringifyScalarValue,
  wrapPath,
} from './utils'
import { ObjectTypes } from '../interfaces'

describe('JSONUtils', () => {
  describe('generatePath', () => {
    it('should generate path for Parent and Children', () => {
      const expectPath = "['parent']['children']"
      const parentPath = "['parent']"
      const children = 'children'
      const result = generatePath(parentPath, children)
      expect(expectPath).toEqual(result)
    })
  })

  describe('wrapPath', () => {
    it('should properly wrap path', () => {
      expect(wrapPath('"key"')).toEqual('["key"]')
      expect(wrapPath('"ke\\"y"')).toEqual("['ke\"y']")
      expect(wrapPath('"key"', 'path')).toEqual('path["key"]')
      expect(wrapPath('"key\\""', 'path')).toEqual("path['key\"']")
    })
  })

  describe('isScalar', () => {
    it('should return Truthy for scalar variables', () => {
      const string = 'string'
      const number = 123
      const boolean = false

      expect(isScalar(string)).toBeTruthy()
      expect(isScalar(number)).toBeTruthy()
      expect(isScalar(boolean)).toBeTruthy()
    })

    it('should return Falsy for object and array variables', () => {
      expect(isScalar([1, 2, 3] as any)).toBeFalsy()
      expect(isScalar({ foo: '' } as any)).toBeFalsy()
    })
  })

  describe('isRealObject', () => {
    it('should properly check for an object', () => {
      expect(isRealObject({})).toBeTruthy()
      expect(isRealObject([], 'object')).toBeTruthy()
      expect(isRealObject([])).toBeFalsy()
      expect(isRealObject(null)).toBeFalsy()
      expect(isRealObject(undefined)).toBeFalsy()
    })
  })

  describe('isRealArray', () => {
    it('should properly check for an array', () => {
      expect(isRealArray([])).toBeTruthy()
      expect(isRealArray([], 'array')).toBeTruthy()
      expect(isRealArray({}, 'array')).toBeTruthy()
      expect(isRealArray([], 'object')).toBeFalsy()
      expect(isRealArray({})).toBeFalsy()
      expect(isRealArray('')).toBeFalsy()
      expect(isRealArray(null)).toBeFalsy()
      expect(isRealArray(undefined)).toBeFalsy()
    })
  })

  describe('getBrackets', () => {
    it('should properly return bracket', () => {
      expect(getBrackets(ObjectTypes.Object, 'start')).toEqual('{')
      expect(getBrackets(ObjectTypes.Object, 'end')).toEqual('}')
      expect(getBrackets(ObjectTypes.Array, 'start')).toEqual('[')
      expect(getBrackets(ObjectTypes.Array, 'end')).toEqual(']')
    })
  })

  describe('isValidKey', () => {
    it('should properly validate key', () => {
      expect(isValidKey('"a"')).toBeTruthy()
      expect(isValidKey('"key_name"')).toBeTruthy()
      expect(isValidKey('"a\'"')).toBeTruthy()
      expect(isValidKey('"a')).toBeFalsy()
      expect(isValidKey('"')).toBeFalsy()
    })
  })

  describe('JSON Parsing Utils', () => {
    const bigintAsString = '1188950299261208742'
    const scientificNotation = 1.2345678901234568e29

    describe('parseValue', () => {
      it('should handle non-string values', () => {
        expect(parseValue(123)).toBe(123)
        expect(parseValue(null)).toBe(null)
        expect(parseValue(undefined)).toBe(undefined)
      })

      it('should parse typed integer values', () => {
        const result = parseValue(bigintAsString, 'integer')
        expect(typeof result).toBe('bigint')
        expect(result.toString()).toBe(bigintAsString)
      })

      it('should parse regular numbers as numbers, not bigints', () => {
        const result = parseValue('42', 'integer')
        expect(typeof result).toBe('number')
        expect(result).toBe(42)
      })

      it('should preserve string values in JSON objects', () => {
        const input = '{"a":"111"}'
        const result = parseValue(input)
        expect(result.a).toBe('111')
        expect(typeof result.a).toBe('string')
      })

      it('should handle mixed string and number values in JSON objects', () => {
        const input = '{"stringVal":"111","numberVal":111}'
        const result = parseValue(input)
        expect(result.stringVal).toBe('111')
        expect(typeof result.stringVal).toBe('string')
        expect(result.numberVal).toBe(111)
        expect(typeof result.numberVal).toBe('number')
      })

      it('should handle string type with quotes', () => {
        expect(parseValue('"test"', 'string')).toBe('test')
        expect(parseValue('test', 'string')).toBe('test')
      })

      it('should parse boolean values', () => {
        expect(parseValue('true', 'boolean')).toBe(true)
        expect(parseValue('false', 'boolean')).toBe(false)
      })

      it('should parse null values', () => {
        expect(parseValue('null', 'null')).toBe(null)
      })

      it('should parse JSON objects without type', () => {
        const input = `{"value": ${bigintAsString}, "text": "test"}`
        const result = parseValue(input)
        expect(typeof result.value).toBe('bigint')
        expect(result.value.toString()).toBe(bigintAsString)
        expect(result.text).toBe('test')
      })

      it('should parse JSON arrays without type', () => {
        const input = `[${bigintAsString}, "test"]`
        const result = parseValue(input)
        expect(typeof result[0]).toBe('bigint')
        expect(result[0].toString()).toBe(bigintAsString)
        expect(result[1]).toBe('test')
      })

      it('should handle extremely large integers and maintain scientific notation', () => {
        const resultFromString = parseValue(
          `'${scientificNotation}'`,
          'integer',
        )
        expect(resultFromString).toBe(`'${scientificNotation}'`)

        const resultFromInt = parseValue(scientificNotation, 'integer')
        expect(resultFromInt).toBe(scientificNotation)

        // Also test parsing as part of JSON
        const jsonWithLargeInt = `{"value": ${scientificNotation}}`
        const parsedJson = parseValue(jsonWithLargeInt)
        expect(parsedJson.value).toBe(scientificNotation)
      })
    })

    describe('parseJsonData', () => {
      it('should handle null or undefined data', () => {
        expect(parseJsonData(null)).toBe(null)
        expect(parseJsonData(undefined)).toBe(undefined)
      })

      it('should parse array of typed values', () => {
        const input = [
          { type: 'string', value: '"John"' },
          { type: 'integer', value: bigintAsString },
        ]
        const result = parseJsonData(input)

        expect(result[0].value).toBe('John')
        expect(typeof result[1].value).toBe('bigint')
        expect(result[1].value.toString()).toBe(bigintAsString)
      })

      it('should preserve non-typed array items', () => {
        const input = [{ value: '"John"' }, { someOtherProp: 'test' }]
        const result = parseJsonData(input)

        expect(result[0].value).toBe('"John"')
        expect(result[1].someOtherProp).toBe('test')
      })
    })
  })

  describe('stringifyScalarValue', () => {
    it('should handle bigint values', () => {
      const bigIntValue = BigInt('9007199254740991')
      expect(stringifyScalarValue(bigIntValue)).toBe('9007199254740991')
    })

    it('should wrap string values in quotes', () => {
      expect(stringifyScalarValue('hello')).toBe('"hello"')
      expect(stringifyScalarValue('')).toBe('""')
    })

    it('should convert null to "null" string', () => {
      expect(stringifyScalarValue(null as any)).toBe('null')
    })

    it('should convert numbers to string representation', () => {
      expect(stringifyScalarValue(42)).toBe('42')
      expect(stringifyScalarValue(-123.456)).toBe('-123.456')
      expect(stringifyScalarValue(0)).toBe('0')
    })

    it('should convert boolean values to string representation', () => {
      expect(stringifyScalarValue(true)).toBe('true')
      expect(stringifyScalarValue(false)).toBe('false')
    })
  })
})
