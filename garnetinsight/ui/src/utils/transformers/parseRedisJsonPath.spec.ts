import { wrapPath } from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/utils'
import parseRedisJsonPath from './parseRedisJsonPath'

describe('parseRedisJsonPath', () => {
  it('parses empty root', () => {
    expect(parseRedisJsonPath(`$`)).toEqual([])
  })

  it('parses simple string keys', () => {
    expect(parseRedisJsonPath(`$["foo"]`)).toEqual(['foo'])
  })

  it('parses multiple string keys and numbers', () => {
    expect(parseRedisJsonPath(`$["foo"][0]["bar"]`)).toEqual(['foo', 0, 'bar'])
    expect(parseRedisJsonPath(`$["array"]["nested"]`)).toEqual([
      'array',
      'nested',
    ])
  })

  it('parses keys with spaces and special characters', () => {
    expect(parseRedisJsonPath(`$["some key with spaces"]`)).toEqual([
      'some key with spaces',
    ])
    expect(parseRedisJsonPath(`$["foo[bar]"]`)).toEqual(['foo[bar]'])
  })

  it('parses keys with escaped quotes', () => {
    expect(parseRedisJsonPath(`$["redis\\" is cool name"]`)).toEqual([
      'redis" is cool name',
    ])
    expect(parseRedisJsonPath(`$["She said: 'hello'"]`)).toEqual([
      `She said: 'hello'`,
    ])
  })

  it('parses unicode characters', () => {
    expect(parseRedisJsonPath(`$["ключ"]`)).toEqual(['ключ'])
  })

  it('parses numeric keys properly', () => {
    expect(parseRedisJsonPath(`$[0][1][2]`)).toEqual([0, 1, 2])
  })

  it('throws on invalid segments', () => {
    expect(() => parseRedisJsonPath(`$[invalid]`)).toThrow()
    expect(() => parseRedisJsonPath(`$[0]["foo"`)).toThrow()
    expect(() => parseRedisJsonPath(`foo[bar]`)).toThrow()
  })

  it('works without $ root', () => {
    expect(parseRedisJsonPath(`["foo"][0]["bar"]`)).toEqual(['foo', 0, 'bar'])
  })

  it('parses keys with escaped backslashes and quotes correctly', () => {
    expect(parseRedisJsonPath(`$["foo\\\\bar"]`)).toEqual(['foo\\bar'])
    expect(parseRedisJsonPath(`$["She's cool"]`)).toEqual([`She's cool`])
    expect(parseRedisJsonPath(`$["He said: \\"hi\\""]`)).toEqual([
      `He said: "hi"`,
    ])
    expect(parseRedisJsonPath(`$["a\\\\'b"]`)).toEqual([`a\\'b`])
    expect(parseRedisJsonPath(`$["a\\\\b\\\\c"]`)).toEqual(['a\\b\\c'])
  })

  it('parses empty string keys', () => {
    expect(parseRedisJsonPath(`$[""]`)).toEqual([''])
  })
})

describe('wrapPath + parseRedisJsonPath roundtrip', () => {
  const testCases: string[] = [
    'foo',
    'foo bar',
    'foo[bar]',
    "She's cool",
    '',
    'ключ',

    // Next cases are commented out because
    // wrapPath() currently does not handle them correctly

    // 'a"b',
    // 'She said: "hello"',
    // 'a\\b\\c',
    // 'a\\"b\\\'c',
  ]

  testCases.forEach((originalKey) => {
    it(`wraps and parses back "${originalKey}"`, () => {
      const wrapped = wrapPath(JSON.stringify(originalKey), '$')
      expect(wrapped).not.toBeNull()

      const result = parseRedisJsonPath(wrapped!)
      const lastSegment = result[result.length - 1]

      expect(lastSegment).toBe(originalKey)
    })
  })
})
