import {
  isIndexableJsonValue,
  filterJsonData,
  parseHashFields,
  parseJsonValue,
} from './helpers'

describe('isIndexableJsonValue', () => {
  it.each([
    { desc: 'null', value: null, expected: true },
    { desc: 'undefined', value: undefined, expected: true },
    { desc: 'string', value: 'hello', expected: true },
    { desc: 'number', value: 42, expected: true },
    { desc: 'boolean', value: true, expected: true },
    { desc: 'geo coordinates array', value: [12.5, 45.3], expected: true },
    { desc: 'vector array', value: [0.1, 0.2, 0.3], expected: true },
    { desc: 'geo object', value: { lon: 12.5, lat: 45.3 }, expected: true },
    { desc: 'string array', value: ['a', 'b'], expected: false },
    { desc: 'nested object', value: { a: 1, b: 2 }, expected: false },
    { desc: 'mixed array', value: [1, 'two'], expected: false },
  ])('should return $expected for $desc', ({ value, expected }) => {
    const result = isIndexableJsonValue(value)
    expect(result).toBe(expected)
  })
})

describe('filterJsonData', () => {
  it('should separate indexable fields from complex nested ones', () => {
    const data = {
      name: 'test',
      count: 5,
      nested: { a: 1, b: 2 },
      tags: ['tag1', 'tag2'],
      location: [12.5, 45.3],
    }

    const { indexable, skippedFields } = filterJsonData(data)

    expect(indexable).toEqual({
      name: 'test',
      count: 5,
      location: [12.5, 45.3],
    })
    expect(skippedFields).toEqual(['nested', 'tags'])
  })

  it('should return all fields as indexable when none are complex', () => {
    const data = { a: 'hello', b: 42, c: true }

    const { indexable, skippedFields } = filterJsonData(data)

    expect(Object.keys(indexable)).toHaveLength(3)
    expect(skippedFields).toEqual([])
  })

  it('should return empty results for empty object', () => {
    const { indexable, skippedFields } = filterJsonData({})

    expect(indexable).toEqual({})
    expect(skippedFields).toEqual([])
  })
})

describe('parseHashFields', () => {
  it('should convert API hash fields into IndexField[]', () => {
    const apiFields = [
      {
        field: { data: [110, 97, 109, 101], type: 'Buffer' as const },
        value: { data: [65, 108, 105, 99, 101], type: 'Buffer' as const },
      },
      {
        field: { data: [97, 103, 101], type: 'Buffer' as const },
        value: { data: [51, 48], type: 'Buffer' as const },
      },
    ]

    const result = parseHashFields(apiFields)

    expect(result.fields).toHaveLength(2)
    expect(result.fields[0].name).toBe('name')
    expect(result.fields[1].name).toBe('age')
    expect(result.skippedFields).toEqual([])
  })

  it('should return empty fields for empty input', () => {
    const result = parseHashFields([])

    expect(result.fields).toEqual([])
    expect(result.skippedFields).toEqual([])
  })
})

describe('parseJsonValue', () => {
  it('should parse a JSON string and infer fields', () => {
    const raw = JSON.stringify([{ title: 'hello', count: 42 }])

    const result = parseJsonValue(raw)

    expect(result.fields).toHaveLength(2)
    expect(result.fields.map((f) => f.name).sort()).toEqual(['count', 'title'])
    expect(result.skippedFields).toEqual([])
  })

  it('should handle a plain object (not wrapped in array)', () => {
    const raw = { name: 'test', price: 99 }

    const result = parseJsonValue(raw)

    expect(result.fields).toHaveLength(2)
    expect(result.skippedFields).toEqual([])
  })

  it('should skip non-indexable nested fields', () => {
    const raw = { simple: 'value', nested: { deep: true } }

    const result = parseJsonValue(raw)

    expect(result.fields).toHaveLength(1)
    expect(result.fields[0].name).toBe('simple')
    expect(result.skippedFields).toEqual(['nested'])
  })

  it('should return empty result for invalid JSON string', () => {
    const result = parseJsonValue('not valid json')

    expect(result.fields).toEqual([])
    expect(result.skippedFields).toEqual([])
  })

  it('should return empty result for null', () => {
    const result = parseJsonValue(null)

    expect(result.fields).toEqual([])
    expect(result.skippedFields).toEqual([])
  })

  it('should return empty result for a primitive', () => {
    const result = parseJsonValue(42)

    expect(result.fields).toEqual([])
    expect(result.skippedFields).toEqual([])
  })

  it('should return empty result for an empty array', () => {
    const result = parseJsonValue([])

    expect(result.fields).toEqual([])
    expect(result.skippedFields).toEqual([])
  })
})
