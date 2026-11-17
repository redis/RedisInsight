import { splitWithPrefixThreshold } from '../splitWithPrefixThreshold'

const COLON = ':'
const COLON_OR_UNDERSCORE = ':|_'

const hashTagTests: [string, string, string[]][] = [
  ['{portal2:co}:something', COLON, ['{portal2:co}', 'something']],
  ['{user}:1:2', COLON, ['{user}', '1', '2']],
  ['a{b:c}:d:{e:f}', COLON, ['a{b:c}', 'd', '{e', 'f}']],
  ['foo{}:bar:baz', COLON, ['foo{}', 'bar', 'baz']],
  ['foo{}{bar:baz}:x', COLON, ['foo{}{bar', 'baz}', 'x']],
  ['foo{bar:baz', COLON, ['foo{bar', 'baz']],
  ['foo}bar{baz:qux', COLON, ['foo}bar{baz', 'qux']],
  ['user:1:name', COLON, ['user', '1', 'name']],
  ['{a:b_c}:d_e', COLON_OR_UNDERSCORE, ['{a:b_c}', 'd', 'e']],
]

describe('splitWithPrefixThreshold', () => {
  it.each(hashTagTests)(
    'splits %s on %s into %s',
    (name, dPattern, expected) => {
      expect(splitWithPrefixThreshold(name, dPattern, 0)).toEqual(expected)
    },
  )

  it('does not split inside a hash tag when a prefix length is set', () => {
    expect(
      splitWithPrefixThreshold('{portal2:co}:something', COLON, 5),
    ).toEqual(['{portal2:co}', 'something'])
  })

  it('lets the prefix length push the first level past the hash tag', () => {
    expect(
      splitWithPrefixThreshold('{tenant:x}:app:resource', COLON, 11),
    ).toEqual(['{tenant:x}:app', 'resource'])
  })

  it('keeps the whole name in one part when the prefix length covers it', () => {
    expect(splitWithPrefixThreshold('{a:b}:c:d', COLON, 8)).toEqual([
      '{a:b}:c:d',
    ])
  })

  it('merges the prefix into the first part when there is no hash tag', () => {
    expect(splitWithPrefixThreshold('tenant:app:resource', COLON, 7)).toEqual([
      'tenant:app',
      'resource',
    ])
  })

  it('splits on every character when no delimiter is configured', () => {
    expect(splitWithPrefixThreshold('{a:b}', '', 0)).toEqual([
      '{',
      'a',
      ':',
      'b',
      '}',
    ])
  })
  it('finds an overlapping delimiter match after the prefix threshold', () => {
    expect(splitWithPrefixThreshold('aaa{x}:z', 'aa', 1)).toEqual([
      'a',
      '{x}:z',
    ])
  })

  it('keeps prefix behaviour when the threshold lands on a delimiter', () => {
    expect(splitWithPrefixThreshold('{a:b}:c:d', COLON, 5)).toEqual([
      '{a:b}',
      'c',
      'd',
    ])
    expect(splitWithPrefixThreshold('{a:b}:c:d', COLON, 6)).toEqual([
      '{a:b}:c',
      'd',
    ])
  })

  it('finds an overlapping delimiter match after a rejected one', () => {
    expect(splitWithPrefixThreshold('{aa}:x', 'aa|a}', 0)).toEqual(['{a', ':x'])
  })

  it('keeps overlapping matches rejected while they stay inside the hash tag', () => {
    expect(splitWithPrefixThreshold('{aab}aay', 'aa|ab', 0)).toEqual([
      '{aab}',
      'y',
    ])
  })
})
