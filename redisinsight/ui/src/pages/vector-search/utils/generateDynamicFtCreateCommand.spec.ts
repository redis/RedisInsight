import {
  FieldTypes,
  RedisearchIndexKeyType,
} from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

import {
  IndexField,
  VectorAlgorithm,
  VectorDataType,
  VectorDistanceMetric,
} from '../components/index-details/IndexDetails.types'
import {
  generateDynamicFtCreateCommand,
  DynamicFtCreateParams,
} from './generateDynamicFtCreateCommand'

const buildParams = (
  overrides?: Partial<DynamicFtCreateParams>,
): DynamicFtCreateParams => ({
  indexName: 'idx:test',
  keyType: RedisearchIndexKeyType.HASH,
  prefix: 'test:',
  fields: [],
  ...overrides,
})

describe('generateDynamicFtCreateCommand', () => {
  describe('basic structure', () => {
    it('should generate command with HASH key type', () => {
      const result = generateDynamicFtCreateCommand(
        buildParams({
          indexName: 'idx:myindex',
          keyType: RedisearchIndexKeyType.HASH,
          prefix: 'myprefix:',
        }),
      )

      expect(result).toContain('FT.CREATE "idx:myindex"')
      expect(result).toContain('ON HASH')
      expect(result).toContain('PREFIX 1 "myprefix:"')
      expect(result).toContain('SCHEMA')
    })

    it('should generate command with JSON key type', () => {
      const result = generateDynamicFtCreateCommand(
        buildParams({
          keyType: RedisearchIndexKeyType.JSON,
          prefix: 'doc:',
        }),
      )

      expect(result).toContain('ON JSON')
      expect(result).toContain('PREFIX 1 "doc:"')
    })

    it('should generate command with empty fields', () => {
      const result = generateDynamicFtCreateCommand(buildParams())

      expect(result).toContain('FT.CREATE "idx:test"')
      expect(result).toContain('SCHEMA')
    })

    it('should generate command with empty index name', () => {
      const result = generateDynamicFtCreateCommand(
        buildParams({ indexName: '' }),
      )

      expect(result).toContain('FT.CREATE ""')
      expect(result).toContain('ON HASH')
    })
  })

  describe('simple field types', () => {
    it.each([
      { type: FieldTypes.NUMERIC, expected: 'NUMERIC' },
      { type: FieldTypes.GEO, expected: 'GEO' },
      { type: FieldTypes.GEOSHAPE, expected: 'GEOSHAPE' },
    ])('should generate $expected field for HASH key', ({ type, expected }) => {
      const fields: IndexField[] = [
        { id: 'f1', name: 'myfield', value: 'val', type },
      ]
      const result = generateDynamicFtCreateCommand(buildParams({ fields }))

      expect(result).toContain(`"myfield" ${expected}`)
    })

    it('should generate TAG field for HASH key', () => {
      const fields: IndexField[] = [
        { id: 'f1', name: 'myfield', value: 'val', type: FieldTypes.TAG },
      ]
      const result = generateDynamicFtCreateCommand(buildParams({ fields }))

      expect(result).toContain('"myfield" TAG')
    })

    it.each([
      { type: FieldTypes.NUMERIC, expected: 'NUMERIC' },
      { type: FieldTypes.GEO, expected: 'GEO' },
      { type: FieldTypes.GEOSHAPE, expected: 'GEOSHAPE' },
    ])(
      'should generate $expected field with JSONPath alias for JSON key',
      ({ type, expected }) => {
        const fields: IndexField[] = [
          { id: 'f1', name: 'myfield', value: 'val', type },
        ]
        const result = generateDynamicFtCreateCommand(
          buildParams({ keyType: RedisearchIndexKeyType.JSON, fields }),
        )

        expect(result).toContain(`$.myfield AS myfield ${expected}`)
      },
    )

    it('should generate TAG field for JSON key', () => {
      const fields: IndexField[] = [
        { id: 'f1', name: 'myfield', value: 'val', type: FieldTypes.TAG },
      ]
      const result = generateDynamicFtCreateCommand(
        buildParams({ keyType: RedisearchIndexKeyType.JSON, fields }),
      )

      expect(result).toContain('$.myfield AS myfield TAG')
    })
  })

  describe('TEXT fields', () => {
    it('should generate TEXT field without WEIGHT when using default', () => {
      const fields: IndexField[] = [
        { id: 'title', name: 'title', value: 'hello', type: FieldTypes.TEXT },
      ]
      const result = generateDynamicFtCreateCommand(buildParams({ fields }))

      expect(result).toContain('"title" TEXT')
      expect(result).not.toContain('WEIGHT')
      expect(result).not.toContain('PHONETIC')
    })

    it('should generate TEXT field with non-default weight', () => {
      const fields: IndexField[] = [
        {
          id: 'title',
          name: 'title',
          value: 'hello',
          type: FieldTypes.TEXT,
          options: { weight: 2.5 },
        },
      ]
      const result = generateDynamicFtCreateCommand(buildParams({ fields }))

      expect(result).toContain('"title" TEXT WEIGHT 2.5')
    })

    it('should generate TEXT field with phonetic', () => {
      const fields: IndexField[] = [
        {
          id: 'title',
          name: 'title',
          value: 'hello',
          type: FieldTypes.TEXT,
          options: { phonetic: 'dm:en' },
        },
      ]
      const result = generateDynamicFtCreateCommand(buildParams({ fields }))

      expect(result).toContain('"title" TEXT PHONETIC dm:en')
    })

    it('should omit PHONETIC when set to none', () => {
      const fields: IndexField[] = [
        {
          id: 'title',
          name: 'title',
          value: 'hello',
          type: FieldTypes.TEXT,
          options: { phonetic: 'none' },
        },
      ]
      const result = generateDynamicFtCreateCommand(buildParams({ fields }))

      expect(result).not.toContain('PHONETIC')
    })

    it('should generate TEXT field with weight and phonetic', () => {
      const fields: IndexField[] = [
        {
          id: 'title',
          name: 'title',
          value: 'hello',
          type: FieldTypes.TEXT,
          options: { weight: 3, phonetic: 'dm:fr' },
        },
      ]
      const result = generateDynamicFtCreateCommand(buildParams({ fields }))

      expect(result).toContain('"title" TEXT WEIGHT 3 PHONETIC dm:fr')
    })
  })

  describe('VECTOR FLAT fields', () => {
    it('should generate VECTOR FLAT with default options when none provided', () => {
      const fields: IndexField[] = [
        {
          id: 'emb',
          name: 'embedding',
          value: '[1,2,3]',
          type: FieldTypes.VECTOR,
        },
      ]
      const result = generateDynamicFtCreateCommand(buildParams({ fields }))

      expect(result).toContain('"embedding" VECTOR FLAT 6')
      expect(result).toContain('TYPE FLOAT32')
      expect(result).toContain('DIM 384')
      expect(result).toContain('DISTANCE_METRIC COSINE')
    })

    it('should generate VECTOR FLAT with explicit options', () => {
      const fields: IndexField[] = [
        {
          id: 'emb',
          name: 'embedding',
          value: '[1,2,3]',
          type: FieldTypes.VECTOR,
          options: {
            algorithm: VectorAlgorithm.FLAT,
            dataType: VectorDataType.FLOAT64,
            dimensions: 768,
            distanceMetric: VectorDistanceMetric.L2,
          },
        },
      ]
      const result = generateDynamicFtCreateCommand(buildParams({ fields }))

      expect(result).toContain('"embedding" VECTOR FLAT 6')
      expect(result).toContain('TYPE FLOAT64')
      expect(result).toContain('DIM 768')
      expect(result).toContain('DISTANCE_METRIC L2')
    })

    it('should generate VECTOR FLAT for JSON key type', () => {
      const fields: IndexField[] = [
        {
          id: 'emb',
          name: 'embedding',
          value: '[1,2,3]',
          type: FieldTypes.VECTOR,
          options: {
            algorithm: VectorAlgorithm.FLAT,
            dimensions: 8,
            distanceMetric: VectorDistanceMetric.COSINE,
          },
        },
      ]
      const result = generateDynamicFtCreateCommand(
        buildParams({ keyType: RedisearchIndexKeyType.JSON, fields }),
      )

      expect(result).toContain('$.embedding AS embedding VECTOR FLAT 6')
      expect(result).toContain('TYPE FLOAT32')
      expect(result).toContain('DIM 8')
      expect(result).toContain('DISTANCE_METRIC COSINE')
    })
  })

  describe('VECTOR HNSW fields', () => {
    it('should generate VECTOR HNSW with all options', () => {
      const fields: IndexField[] = [
        {
          id: 'emb',
          name: 'embedding',
          value: '[1,2,3]',
          type: FieldTypes.VECTOR,
          options: {
            algorithm: VectorAlgorithm.HNSW,
            dataType: VectorDataType.FLOAT32,
            dimensions: 512,
            distanceMetric: VectorDistanceMetric.IP,
            maxEdges: 32,
            maxNeighbors: 400,
            candidateLimit: 20,
            epsilon: 0.05,
          },
        },
      ]
      const result = generateDynamicFtCreateCommand(buildParams({ fields }))

      expect(result).toContain('"embedding" VECTOR HNSW 14')
      expect(result).toContain('TYPE FLOAT32')
      expect(result).toContain('DIM 512')
      expect(result).toContain('DISTANCE_METRIC IP')
      expect(result).toContain('M 32')
      expect(result).toContain('EF_CONSTRUCTION 400')
      expect(result).toContain('EF_RUNTIME 20')
      expect(result).toContain('EPSILON 0.05')
    })

    it('should generate VECTOR HNSW with only base options', () => {
      const fields: IndexField[] = [
        {
          id: 'emb',
          name: 'embedding',
          value: '[1,2,3]',
          type: FieldTypes.VECTOR,
          options: {
            algorithm: VectorAlgorithm.HNSW,
            dimensions: 256,
            distanceMetric: VectorDistanceMetric.COSINE,
          },
        },
      ]
      const result = generateDynamicFtCreateCommand(buildParams({ fields }))

      expect(result).toContain('"embedding" VECTOR HNSW 6')
      expect(result).toContain('TYPE FLOAT32')
      expect(result).toContain('DIM 256')
      expect(result).toContain('DISTANCE_METRIC COSINE')
      expect(result).not.toMatch(/\bM \d/)
      expect(result).not.toContain('EF_CONSTRUCTION')
      expect(result).not.toContain('EF_RUNTIME')
      expect(result).not.toContain('EPSILON')
    })

    it('should generate VECTOR HNSW with partial options', () => {
      const fields: IndexField[] = [
        {
          id: 'emb',
          name: 'embedding',
          value: '[1,2,3]',
          type: FieldTypes.VECTOR,
          options: {
            algorithm: VectorAlgorithm.HNSW,
            dimensions: 128,
            distanceMetric: VectorDistanceMetric.L2,
            maxEdges: 16,
          },
        },
      ]
      const result = generateDynamicFtCreateCommand(buildParams({ fields }))

      expect(result).toContain('"embedding" VECTOR HNSW 8')
      expect(result).toContain('M 16')
      expect(result).not.toContain('EF_CONSTRUCTION')
    })
  })

  describe('mixed fields', () => {
    it('should generate command with multiple field types', () => {
      const fields: IndexField[] = [
        { id: 'title', name: 'title', value: 'test', type: FieldTypes.TEXT },
        { id: 'genre', name: 'genre', value: 'comedy', type: FieldTypes.TAG },
        { id: 'year', name: 'year', value: 2024, type: FieldTypes.NUMERIC },
        { id: 'loc', name: 'location', value: '1,2', type: FieldTypes.GEO },
        {
          id: 'emb',
          name: 'embedding',
          value: '[1,2,3]',
          type: FieldTypes.VECTOR,
          options: {
            algorithm: VectorAlgorithm.FLAT,
            dimensions: 8,
            distanceMetric: VectorDistanceMetric.COSINE,
          },
        },
      ]

      const result = generateDynamicFtCreateCommand(
        buildParams({
          indexName: 'idx:mixed',
          prefix: 'item:',
          fields,
        }),
      )

      expect(result).toContain('FT.CREATE "idx:mixed"')
      expect(result).toContain('PREFIX 1 "item:"')
      expect(result).toContain('"title" TEXT')
      expect(result).toContain('"genre" TAG')
      expect(result).toContain('"year" NUMERIC')
      expect(result).toContain('"location" GEO')
      expect(result).toContain('"embedding" VECTOR FLAT 6')
    })

    it('should reorder fields by type to avoid keyword clashes', () => {
      const fields: IndexField[] = [
        { id: 'title', name: 'title', value: 'test', type: FieldTypes.TEXT },
        { id: 'genre', name: 'genre', value: 'comedy', type: FieldTypes.TAG },
        { id: 'year', name: 'year', value: 2024, type: FieldTypes.NUMERIC },
      ]

      const result = generateDynamicFtCreateCommand(buildParams({ fields }))

      const numericIdx = result.indexOf('"year" NUMERIC')
      const tagIdx = result.indexOf('"genre" TAG')
      const textIdx = result.indexOf('"title" TEXT')

      expect(numericIdx).toBeLessThan(tagIdx)
      expect(tagIdx).toBeLessThan(textIdx)
    })

    it('should generate JSON command with multiple field types', () => {
      const fields: IndexField[] = [
        { id: 'title', name: 'title', value: 'test', type: FieldTypes.TEXT },
        { id: 'tags', name: 'tags', value: 'a,b', type: FieldTypes.TAG },
        { id: 'year', name: 'year', value: 2024, type: FieldTypes.NUMERIC },
      ]

      const result = generateDynamicFtCreateCommand(
        buildParams({
          keyType: RedisearchIndexKeyType.JSON,
          prefix: 'doc:',
          fields,
        }),
      )

      expect(result).toContain('ON JSON')
      expect(result).toContain('$.title AS title TEXT')
      expect(result).toContain('$.tags AS tags TAG')
      expect(result).toContain('$.year AS year NUMERIC')
    })
  })

  describe('reserved keyword field names', () => {
    it('should place NUMERIC "weight" before TEXT fields via reordering', () => {
      const fields: IndexField[] = [
        {
          id: 'desc',
          name: 'description',
          value: 'hello',
          type: FieldTypes.TEXT,
        },
        {
          id: 'w',
          name: 'weight',
          value: '10',
          type: FieldTypes.NUMERIC,
        },
      ]
      const result = generateDynamicFtCreateCommand(buildParams({ fields }))

      const weightIdx = result.indexOf('"weight" NUMERIC')
      const descIdx = result.indexOf('"description" TEXT')

      expect(weightIdx).toBeLessThan(descIdx)
    })

    it('should place TAG fields before TEXT to avoid "separator" clash', () => {
      const fields: IndexField[] = [
        {
          id: 's',
          name: 'separator',
          value: ';',
          type: FieldTypes.TEXT,
        },
        { id: 't', name: 'tags', value: 'a,b', type: FieldTypes.TAG },
      ]
      const result = generateDynamicFtCreateCommand(buildParams({ fields }))

      const tagIdx = result.indexOf('"tags" TAG')
      const textIdx = result.indexOf('"separator" TEXT')

      expect(tagIdx).toBeLessThan(textIdx)
    })
  })

  describe('field name handling', () => {
    it('should quote HASH field names with special characters', () => {
      const fields: IndexField[] = [
        {
          id: 'f1',
          name: 'my-field',
          value: 'val',
          type: FieldTypes.TEXT,
        },
      ]
      const result = generateDynamicFtCreateCommand(buildParams({ fields }))

      expect(result).toContain('"my-field" TEXT')
    })

    it('should generate JSONPath for JSON field names with special characters', () => {
      const fields: IndexField[] = [
        {
          id: 'f1',
          name: 'my_field',
          value: 'val',
          type: FieldTypes.TAG,
        },
      ]
      const result = generateDynamicFtCreateCommand(
        buildParams({ keyType: RedisearchIndexKeyType.JSON, fields }),
      )

      expect(result).toContain('$.my_field AS my_field TAG')
    })
  })
})
