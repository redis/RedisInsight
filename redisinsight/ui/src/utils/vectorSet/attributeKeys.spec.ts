import {
  extractAttributeKeys,
  mergeAttributeKeys,
} from 'uiSrc/utils/vectorSet/attributeKeys'

describe('extractAttributeKeys', () => {
  it('returns top-level keys from a JSON object', () => {
    expect(extractAttributeKeys('{"a":1,"b":2}')).toEqual(['a', 'b'])
  })

  it('returns [] for empty / null / undefined', () => {
    expect(extractAttributeKeys('')).toEqual([])
    expect(extractAttributeKeys(null)).toEqual([])
    expect(extractAttributeKeys(undefined)).toEqual([])
  })

  it('returns [] for non-object JSON', () => {
    expect(extractAttributeKeys('"foo"')).toEqual([])
    expect(extractAttributeKeys('42')).toEqual([])
    expect(extractAttributeKeys('true')).toEqual([])
    expect(extractAttributeKeys('null')).toEqual([])
    expect(extractAttributeKeys('[1,2,3]')).toEqual([])
  })

  it('returns [] for invalid JSON', () => {
    expect(extractAttributeKeys('not-json')).toEqual([])
    expect(extractAttributeKeys('{a:1}')).toEqual([])
  })
})

describe('mergeAttributeKeys', () => {
  it('unions existing and discovered keys alphabetically', () => {
    const result = mergeAttributeKeys(
      ['color'],
      [
        { attributes: '{"price":10,"category":"books"}' },
        { attributes: '{"color":"red"}' },
      ],
    )
    expect(result).toEqual(['category', 'color', 'price'])
  })

  it('returns same reference when no new keys appear', () => {
    const existing = ['a', 'b']
    const result = mergeAttributeKeys(existing, [
      { attributes: '{"a":1,"b":2}' },
    ])
    expect(result).toBe(existing)
  })

  it('handles items without attributes', () => {
    expect(mergeAttributeKeys(['x'], [{}, { attributes: undefined }])).toEqual([
      'x',
    ])
  })

  it('returns existing when items is empty', () => {
    const existing = ['x']
    expect(mergeAttributeKeys(existing, [])).toBe(existing)
  })
})
