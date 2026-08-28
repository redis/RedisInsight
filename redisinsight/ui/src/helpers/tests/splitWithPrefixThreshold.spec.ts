import { splitWithPrefixThreshold } from '../splitWithPrefixThreshold'

const COLON = ':'
const COLON_OR_UNDERSCORE = ':|_'

const hashTagTests: [string, string, string[]][] = [
  // a hash tag containing a delimiter stays in one part
  ['{portal2:co}:something', COLON, ['{portal2:co}', 'something']],
  // a hash tag with no delimiter inside it behaves as before
  ['{user}:1:2', COLON, ['{user}', '1', '2']],
  // only the first `{`...`}` pair is a hash tag
  ['a{b:c}:d:{e:f}', COLON, ['a{b:c}', 'd', '{e', 'f}']],
  // an empty `{}` is not a hash tag
  ['foo{}:bar:baz', COLON, ['foo{}', 'bar', 'baz']],
  // `}` closes the first `{` even when it leaves the tag empty
  ['foo{}{bar:baz}:x', COLON, ['foo{}{bar', 'baz}', 'x']],
  // no closing brace
  ['foo{bar:baz', COLON, ['foo{bar', 'baz']],
  // the only `}` comes before the first `{`
  ['foo}bar{baz:qux', COLON, ['foo}bar{baz', 'qux']],
  // no braces at all
  ['user:1:name', COLON, ['user', '1', 'name']],
  // every configured delimiter is ignored inside the hash tag
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
  // A rejected match must not consume an overlapping eligible one: `/aa/g`
  // matches at index 0, which the prefix threshold rejects, and the real
  // match at index 1 must still be found.
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
})
