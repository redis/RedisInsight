import { faker } from '@faker-js/faker'
import {
  FieldTypes,
  RedisearchIndexKeyType,
} from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import {
  isGeoShape,
  isGeoString,
  isGeoCoordinates,
  isVector,
  isVectorLikeString,
  isNumeric,
  inferFieldType,
  inferHashKeyFields,
  inferKeyFields,
} from './inferFieldType'

describe('isGeoShape', () => {
  it.each([
    { value: 'POINT(1.5 2.5)', desc: 'POINT' },
    { value: 'POLYGON((0 0, 1 0, 1 1, 0 1, 0 0))', desc: 'POLYGON' },
    { value: 'LINESTRING(0 0, 1 1, 2 2)', desc: 'LINESTRING' },
    { value: 'MULTIPOINT(0 0, 1 1)', desc: 'MULTIPOINT' },
    { value: 'MULTIPOLYGON(((0 0, 1 0, 1 1, 0 0)))', desc: 'MULTIPOLYGON' },
    {
      value: 'MULTILINESTRING((0 0, 1 1), (2 2, 3 3))',
      desc: 'MULTILINESTRING',
    },
    { value: 'GEOMETRYCOLLECTION(POINT(1 1))', desc: 'GEOMETRYCOLLECTION' },
    { value: 'point(1.5 2.5)', desc: 'lowercase point' },
    { value: 'Point(1 2)', desc: 'mixed case Point' },
    { value: '  POINT(1 2)', desc: 'leading whitespace' },
  ])('should return true for $desc', ({ value }) => {
    expect(isGeoShape(value)).toBe(true)
  })

  it.each([
    { value: 'POINTLESS text', desc: 'word starting with POINT but not WKT' },
    { value: 'hello world', desc: 'plain string' },
    { value: '42', desc: 'numeric string' },
    { value: '', desc: 'empty string' },
    { value: 'POINT', desc: 'WKT keyword without parenthesis' },
    { value: 'POINT(', desc: 'WKT keyword with open paren only (malformed)' },
    { value: 'POINT(1 2', desc: 'WKT with no closing paren (malformed)' },
    { value: 'point()', desc: 'empty WKT parentheses (malformed)' },
  ])('should return false for $desc', ({ value }) => {
    expect(isGeoShape(value)).toBe(false)
  })
})

describe('isGeoString', () => {
  it.each([
    { value: '-122.4194,37.7749', desc: 'lon,lat' },
    { value: '0,0', desc: 'origin' },
    { value: '-180,-90', desc: 'min bounds' },
    { value: '180,90', desc: 'max bounds' },
    { value: ' -122.4194 , 37.7749 ', desc: 'whitespace around values' },
    { value: '0.0,0.0', desc: 'decimal zeros' },
  ])('should return true for $desc', ({ value }) => {
    expect(isGeoString(value)).toBe(true)
  })

  it.each([
    { value: '181,0', desc: 'lon out of range (> 180)' },
    { value: '0,91', desc: 'lat out of range (> 90)' },
    { value: '-181,0', desc: 'lon out of range (< -180)' },
    { value: '0,-91', desc: 'lat out of range (< -90)' },
    { value: 'hello,world', desc: 'non-numeric values' },
    { value: '1,2,3', desc: 'three components' },
    { value: '42', desc: 'single number' },
    { value: '', desc: 'empty string' },
    { value: ',', desc: 'just comma' },
  ])('should return false for $desc', ({ value }) => {
    expect(isGeoString(value)).toBe(false)
  })
})

describe('isGeoCoordinates', () => {
  it.each([
    { value: [-122.4194, 37.7749], desc: '[lon, lat] array' },
    { value: [0, 0], desc: 'origin array' },
    { value: [-180, -90], desc: 'min bounds array' },
    { value: [180, 90], desc: 'max bounds array' },
    {
      value: { lon: -122.4194, lat: 37.7749 },
      desc: 'object with lon, lat',
    },
    {
      value: { lat: 37.7749, lon: -122.4194 },
      desc: 'object with lat, lon',
    },
    {
      value: { longitude: 0, latitude: 0 },
      desc: 'object with longitude, latitude',
    },
  ])('should return true for $desc', ({ value }) => {
    expect(isGeoCoordinates(value)).toBe(true)
  })

  it.each([
    { value: [181, 0], desc: 'lon out of range in array' },
    { value: [0, 91], desc: 'lat out of range in array' },
    { value: [1, 2, 3], desc: 'three elements' },
    { value: [1], desc: 'single element' },
    { value: ['a', 'b'], desc: 'non-numeric array' },
    { value: {}, desc: 'empty object' },
    { value: { x: 1, y: 2 }, desc: 'object without lat/lon' },
    { value: { lon: 1 }, desc: 'object missing lat' },
    { value: null, desc: 'null' },
    { value: '-122.4,37.7', desc: 'string' },
  ])('should return false for $desc', ({ value }) => {
    expect(isGeoCoordinates(value)).toBe(false)
  })
})

describe('isVector', () => {
  it.each([
    { value: [1, 2, 3], desc: 'integer array' },
    { value: [1.5, -2.0, 3.14], desc: 'float array' },
    { value: [0, 0], desc: 'minimal length array' },
  ])('should return true for $desc', ({ value }) => {
    expect(isVector(value)).toBe(true)
  })

  it.each([
    { value: [], desc: 'empty array' },
    { value: [1], desc: 'single element (too short)' },
    { value: [1, 'a', 3], desc: 'mixed types' },
    { value: ['a', 'b'], desc: 'string array' },
    { value: [1, Number.NaN, 3], desc: 'NaN in array' },
    { value: [1, Number.POSITIVE_INFINITY], desc: 'Infinity in array' },
    { value: null, desc: 'null' },
    { value: 'not an array', desc: 'string' },
  ])('should return false for $desc', ({ value }) => {
    expect(isVector(value)).toBe(false)
  })
})

describe('isVectorLikeString', () => {
  it.each([
    { value: '[1,2,3]', desc: 'integer array string' },
    { value: '[1.5, -2.0, 3.14]', desc: 'float array string' },
    { value: '[0, 0]', desc: 'minimal length array string' },
    { value: ' [1, 2, 3] ', desc: 'surrounding whitespace' },
  ])('should return true for $desc', ({ value }) => {
    expect(isVectorLikeString(value)).toBe(true)
  })

  it.each([
    { value: '[]', desc: 'empty array' },
    { value: '[1]', desc: 'single element (too short)' },
    { value: '[1, "a", 3]', desc: 'mixed types' },
    { value: '["a", "b"]', desc: 'string array' },
    { value: 'not an array', desc: 'plain string' },
    { value: '{1, 2, 3}', desc: 'curly braces' },
    { value: '', desc: 'empty string' },
    { value: '[1, NaN, 3]', desc: 'NaN in array' },
    { value: '[1, Infinity]', desc: 'Infinity in array' },
  ])('should return false for $desc', ({ value }) => {
    expect(isVectorLikeString(value)).toBe(false)
  })
})

describe('isNumeric', () => {
  it.each([
    { value: '42', desc: 'integer' },
    { value: '-3.14', desc: 'negative float' },
    { value: '+100', desc: 'positive sign' },
    { value: '0', desc: 'zero' },
    { value: '.5', desc: 'leading dot' },
    { value: '1e10', desc: 'scientific notation' },
    { value: '2.5E-3', desc: 'scientific with capital E' },
    { value: '1.0', desc: 'float with trailing zero' },
    { value: ' 42 ', desc: 'whitespace padded' },
  ])('should return true for $desc', ({ value }) => {
    expect(isNumeric(value)).toBe(true)
  })

  it.each([
    { value: '12abc', desc: 'alphanumeric' },
    { value: '', desc: 'empty string' },
    { value: '   ', desc: 'whitespace only' },
    { value: 'hello', desc: 'word' },
    { value: '1,000', desc: 'thousands separator' },
    { value: '1.2.3', desc: 'multiple dots' },
  ])('should return false for $desc', ({ value }) => {
    expect(isNumeric(value)).toBe(false)
  })
})

describe('inferFieldType', () => {
  describe('string-based detection', () => {
    it('should return GEOSHAPE for WKT patterns', () => {
      expect(inferFieldType('POINT(1 2)')).toBe(FieldTypes.GEOSHAPE)
    })

    it('should return GEO for coordinate patterns', () => {
      expect(inferFieldType('-122.4194,37.7749')).toBe(FieldTypes.GEO)
    })

    it('should return VECTOR for numeric arrays', () => {
      expect(inferFieldType('[1, 2, 3, 4]')).toBe(FieldTypes.VECTOR)
    })

    it('should return NUMERIC for numeric strings', () => {
      expect(inferFieldType('42')).toBe(FieldTypes.NUMERIC)
    })

    it('should return TAG for short strings', () => {
      const shortValue = faker.string.alpha(49)
      expect(inferFieldType(shortValue)).toBe(FieldTypes.TAG)
    })

    it('should return TEXT for long strings', () => {
      const longValue = faker.string.alpha(50)
      expect(inferFieldType(longValue)).toBe(FieldTypes.TEXT)
    })

    it('should return TAG for empty string', () => {
      expect(inferFieldType('')).toBe(FieldTypes.TAG)
    })
  })

  describe('priority order', () => {
    it('should prefer GEOSHAPE over GEO for WKT with coordinates', () => {
      expect(inferFieldType('POINT(-122.4 37.7)')).toBe(FieldTypes.GEOSHAPE)
    })

    it('should not infer GEOSHAPE for malformed WKT (no closing paren or empty)', () => {
      expect(inferFieldType('POINT(')).toBe(FieldTypes.TAG)
      expect(inferFieldType('POINT(1 2')).toBe(FieldTypes.TAG)
      expect(inferFieldType('point()')).toBe(FieldTypes.TAG)
    })

    it('should prefer GEO over NUMERIC for coordinate-like values', () => {
      expect(inferFieldType('10,20')).toBe(FieldTypes.GEO)
    })

    it('should prefer VECTOR over TAG for short numeric arrays', () => {
      expect(inferFieldType('[1,2]')).toBe(FieldTypes.VECTOR)
    })

    it('documents inconsistency: 2D numeric array in lon/lat range is GEO, same as string is VECTOR', () => {
      expect(inferFieldType([1, 2])).toBe(FieldTypes.GEO)
      expect(inferFieldType('[1,2]')).toBe(FieldTypes.VECTOR)
    })

    it('should prefer NUMERIC over TAG for short numeric strings', () => {
      expect(inferFieldType('42')).toBe(FieldTypes.NUMERIC)
    })
  })

  describe('value-based detection (number, boolean, null, array, object)', () => {
    it.each([
      { value: 42, desc: 'integer' },
      { value: 99.9, desc: 'float' },
    ])('should return NUMERIC for $desc', ({ value }) => {
      expect(inferFieldType(value)).toBe(FieldTypes.NUMERIC)
    })

    it('should return TAG for boolean', () => {
      expect(inferFieldType(true)).toBe(FieldTypes.TAG)
      expect(inferFieldType(false)).toBe(FieldTypes.TAG)
    })

    it('should return TAG for null and undefined', () => {
      expect(inferFieldType(null)).toBe(FieldTypes.TAG)
      expect(inferFieldType(undefined)).toBe(FieldTypes.TAG)
    })

    it('should return VECTOR for array of numbers', () => {
      expect(inferFieldType([1, 2, 3])).toBe(FieldTypes.VECTOR)
    })

    it('should return TEXT for array of non-numbers (structured data, not a single tag)', () => {
      expect(inferFieldType(['a', 'b'])).toBe(FieldTypes.TEXT)
    })

    it('should return TEXT for object', () => {
      expect(inferFieldType({})).toBe(FieldTypes.TEXT)
      expect(inferFieldType({ foo: 1 })).toBe(FieldTypes.TEXT)
    })

    it('should return GEO for [lon, lat] array', () => {
      expect(inferFieldType([-122.4194, 37.7749])).toBe(FieldTypes.GEO)
      expect(inferFieldType([0, 0])).toBe(FieldTypes.GEO)
    })

    it('should return GEO for { lat, lon } object', () => {
      expect(inferFieldType({ lon: -122.4194, lat: 37.7749 })).toBe(
        FieldTypes.GEO,
      )
      expect(inferFieldType({ lat: 0, lon: 0 })).toBe(FieldTypes.GEO)
    })

    it('should return VECTOR for 3+ element numeric array not GEO', () => {
      expect(inferFieldType([1, 2, 3])).toBe(FieldTypes.VECTOR)
    })

    it('should use string detection when value is string', () => {
      expect(inferFieldType('42')).toBe(FieldTypes.NUMERIC)
      expect(inferFieldType('short')).toBe(FieldTypes.TAG)
    })
  })
})

describe('inferHashKeyFields', () => {
  it('should infer types for all hash fields', () => {
    const fields = [
      { field: 'price', value: '1398' },
      { field: 'brand', value: 'Eva' },
      { field: 'coords', value: '-122.4194,37.7749' },
      { field: 'shape', value: 'POLYGON((0 0, 1 0, 1 1, 0 0))' },
      { field: 'embedding', value: '[0.1, 0.2, 0.3]' },
      { field: 'description', value: faker.string.alpha(100) },
    ]

    const result = inferHashKeyFields(fields)

    expect(result).toHaveLength(6)
    expect(result[0]).toEqual({
      id: 'price',
      name: 'price',
      value: '1398',
      type: FieldTypes.NUMERIC,
    })
    expect(result[1]).toEqual({
      id: 'brand',
      name: 'brand',
      value: 'Eva',
      type: FieldTypes.TAG,
    })
    expect(result[2].type).toBe(FieldTypes.GEO)
    expect(result[3].type).toBe(FieldTypes.GEOSHAPE)
    expect(result[4].type).toBe(FieldTypes.VECTOR)
    expect(result[5].type).toBe(FieldTypes.TEXT)
  })

  it('should return empty array for empty input', () => {
    expect(inferHashKeyFields([])).toEqual([])
  })
})

describe('inferKeyFields', () => {
  it('should walk Hash key object and infer types when keyType is hash', () => {
    const hashObject = {
      price: '99',
      name: 'bike',
    }

    const result = inferKeyFields(hashObject, RedisearchIndexKeyType.HASH)

    expect(result).toHaveLength(2)
    expect(result).toEqual(
      inferHashKeyFields([
        { field: 'price', value: '99' },
        { field: 'name', value: 'bike' },
      ]),
    )
    expect(result[0].type).toBe(FieldTypes.NUMERIC)
    expect(result[1].type).toBe(FieldTypes.TAG)
  })

  it('should walk JSON key object and infer types when keyType is json', () => {
    const jsonObject = {
      count: 10,
      label: 'active',
    }

    const result = inferKeyFields(jsonObject, RedisearchIndexKeyType.JSON)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      id: 'count',
      name: 'count',
      value: '10',
      type: FieldTypes.NUMERIC,
    })
    expect(result[1]).toEqual({
      id: 'label',
      name: 'label',
      value: 'active',
      type: FieldTypes.TAG,
    })
  })

  it('should treat numeric strings as TAG/TEXT for JSON (only actual numbers as NUMERIC)', () => {
    const jsonObject = {
      actualNumber: 42,
      numericString: '1398',
    }

    const result = inferKeyFields(jsonObject, RedisearchIndexKeyType.JSON)

    expect(result).toHaveLength(2)
    expect(result[0].type).toBe(FieldTypes.NUMERIC)
    expect(result[1].type).toBe(FieldTypes.TAG)
  })

  it('should return empty array for empty object', () => {
    expect(inferKeyFields({}, RedisearchIndexKeyType.HASH)).toEqual([])
    expect(inferKeyFields({}, RedisearchIndexKeyType.JSON)).toEqual([])
  })
})
