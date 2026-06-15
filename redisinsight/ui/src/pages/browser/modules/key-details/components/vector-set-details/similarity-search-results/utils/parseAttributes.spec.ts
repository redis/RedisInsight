import { stringToBuffer } from 'uiSrc/utils'
import { VectorSetSimilarityMatch } from 'uiSrc/slices/interfaces/vectorSet'
import { vectorSetSimilarityMatchFactory } from 'uiSrc/mocks/factories/browser/vectorSet/vectorSetElement.factory'

import {
  collectAttributeKeys,
  getParsedAttributes,
  parseAttributes,
  renderAttributeValue,
} from './parseAttributes'

const match = (
  name: string,
  score: number,
  attributes?: string,
): VectorSetSimilarityMatch =>
  vectorSetSimilarityMatchFactory.build({
    name: stringToBuffer(name),
    score,
    attributes,
  })

describe('parseAttributes', () => {
  it('returns {} for undefined/null/empty input', () => {
    expect(parseAttributes(undefined)).toEqual({})
    expect(parseAttributes(null)).toEqual({})
    expect(parseAttributes('')).toEqual({})
  })

  it('returns {} for malformed JSON', () => {
    expect(parseAttributes('{not json')).toEqual({})
    expect(parseAttributes('undefined')).toEqual({})
  })

  it('returns {} for non-object JSON roots', () => {
    expect(parseAttributes('null')).toEqual({})
    expect(parseAttributes('42')).toEqual({})
    expect(parseAttributes('"foo"')).toEqual({})
    expect(parseAttributes('[1, 2, 3]')).toEqual({})
  })

  it('returns the parsed object for valid JSON', () => {
    expect(parseAttributes('{"a":1,"b":"x"}')).toEqual({ a: 1, b: 'x' })
  })

  it('preserves nested values without flattening', () => {
    const raw = '{"meta":{"score":0.9,"tags":["t1","t2"]}}'
    expect(parseAttributes(raw)).toEqual({
      meta: { score: 0.9, tags: ['t1', 't2'] },
    })
  })
})

describe('collectAttributeKeys', () => {
  it('returns an empty array for no matches', () => {
    expect(collectAttributeKeys([])).toEqual([])
  })

  it('returns an empty array when no match has attributes', () => {
    expect(
      collectAttributeKeys([match('a', 0.9), match('b', 0.8, '')]),
    ).toEqual([])
  })

  it('unions top-level keys across matches', () => {
    const keys = collectAttributeKeys([
      match('a', 0.9, '{"x":1,"y":2}'),
      match('b', 0.8, '{"y":3,"z":4}'),
    ])
    expect(keys).toEqual(['x', 'y', 'z'])
  })

  it('returns keys in stable alphabetical order regardless of input', () => {
    const keys = collectAttributeKeys([match('a', 0.9, '{"z":1,"a":2,"m":3}')])
    expect(keys).toEqual(['a', 'm', 'z'])
  })

  it('skips malformed and non-object attributes', () => {
    const keys = collectAttributeKeys([
      match('a', 0.9, '{"x":1}'),
      match('b', 0.8, 'not-json'),
      match('c', 0.7, '[1,2,3]'),
      match('d', 0.6, 'null'),
      match('e', 0.5, '{"y":2}'),
    ])
    expect(keys).toEqual(['x', 'y'])
  })
})

describe('getParsedAttributes', () => {
  it('returns the parsed attributes for a match', () => {
    const m = match('a', 0.9, '{"city":"NYC","count":3}')
    expect(getParsedAttributes(m)).toEqual({ city: 'NYC', count: 3 })
  })

  it('returns the same object reference on repeated calls for the same match', () => {
    // Identity check proves memoization: a fresh `JSON.parse` would produce a
    // different reference each call.
    const m = match('a', 0.9, '{"city":"NYC"}')
    const first = getParsedAttributes(m)
    const second = getParsedAttributes(m)
    expect(second).toBe(first)
  })

  it('does not share parsed entries across distinct match objects', () => {
    const m1 = match('a', 0.9, '{"city":"NYC"}')
    const m2 = match('b', 0.8, '{"city":"LA"}')
    expect(getParsedAttributes(m1)).not.toBe(getParsedAttributes(m2))
    expect(getParsedAttributes(m1)).toEqual({ city: 'NYC' })
    expect(getParsedAttributes(m2)).toEqual({ city: 'LA' })
  })

  it('returns {} for malformed attributes and memoizes that too', () => {
    const m = match('a', 0.9, '{not json')
    const first = getParsedAttributes(m)
    expect(first).toEqual({})
    expect(getParsedAttributes(m)).toBe(first)
  })
})

describe('renderAttributeValue', () => {
  it('renders empty string for nullish values', () => {
    expect(renderAttributeValue(null)).toBe('')
    expect(renderAttributeValue(undefined)).toBe('')
  })

  it('stringifies primitives', () => {
    expect(renderAttributeValue('foo')).toBe('foo')
    expect(renderAttributeValue(42)).toBe('42')
    expect(renderAttributeValue(0)).toBe('0')
    expect(renderAttributeValue(true)).toBe('true')
    expect(renderAttributeValue(false)).toBe('false')
  })

  it('JSON-stringifies arrays and objects', () => {
    expect(renderAttributeValue([1, 2, 3])).toBe('[1,2,3]')
    expect(renderAttributeValue({ a: 1 })).toBe('{"a":1}')
  })

  it('returns empty string for non-serialisable values', () => {
    const cyclic: Record<string, unknown> = {}
    cyclic.self = cyclic
    expect(renderAttributeValue(cyclic)).toBe('')
  })
})
