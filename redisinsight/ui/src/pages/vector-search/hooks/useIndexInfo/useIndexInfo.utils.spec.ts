import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import {
  indexInfoFactory,
  indexInfoAttributeFactory,
} from 'uiSrc/mocks/factories/redisearch/IndexInfo.factory'

import { normalizeFieldType, transformIndexInfo } from './useIndexInfo.utils'

describe('useIndexInfo.utils', () => {
  describe('normalizeFieldType', () => {
    it.each([
      ['TEXT', FieldTypes.TEXT],
      ['TAG', FieldTypes.TAG],
      ['NUMERIC', FieldTypes.NUMERIC],
      ['GEO', FieldTypes.GEO],
      ['GEOSHAPE', FieldTypes.GEOSHAPE],
      ['VECTOR', FieldTypes.VECTOR],
      ['text', FieldTypes.TEXT],
    ])('should convert %s to %s', (input, expected) => {
      expect(normalizeFieldType(input)).toBe(expected)
    })
  })

  describe('transformIndexInfo', () => {
    it('should transform API response to frontend model', () => {
      const apiResponse = indexInfoFactory.build()

      const result = transformIndexInfo(apiResponse)

      // Verify snake_case → camelCase transformation
      expect(result.indexDefinition?.keyType).toBe(
        apiResponse.index_definition?.key_type,
      )
      expect(result.indexDefinition?.prefixes).toEqual(
        apiResponse.index_definition?.prefixes,
      )
      expect(result.indexOptions?.filter).toBe(
        apiResponse.index_options?.filter,
      )
      expect(result.indexOptions?.defaultLang).toBe(
        apiResponse.index_options?.default_lang,
      )

      // Verify string → number transformation
      expect(result.numDocs).toBe(Number(apiResponse.num_docs))
      expect(result.maxDocId).toBe(Number(apiResponse.max_doc_id))
      expect(result.numRecords).toBe(Number(apiResponse.num_records))
      expect(result.numTerms).toBe(Number(apiResponse.num_terms))

      // Verify attributes transformation
      expect(result.attributes).toHaveLength(apiResponse.attributes.length)
      expect(result.attributes[0].identifier).toBe(
        apiResponse.attributes[0].identifier,
      )
      expect(result.attributes[0].attribute).toBe(
        apiResponse.attributes[0].attribute,
      )
      expect(result.attributes[0].type).toBe(
        apiResponse.attributes[0].type.toLowerCase(),
      )
    })

    it('should handle missing index options', () => {
      const apiResponse = indexInfoFactory.build({
        index_options: undefined,
      })

      const result = transformIndexInfo(apiResponse)

      expect(result.indexOptions).toBeUndefined()
    })

    it('should handle empty attributes array', () => {
      const apiResponse = indexInfoFactory.build({
        attributes: [],
      })

      const result = transformIndexInfo(apiResponse)

      expect(result.attributes).toEqual([])
    })

    it('should handle attributes without weight', () => {
      const apiResponse = indexInfoFactory.build({
        attributes: [
          indexInfoAttributeFactory.build(
            { type: 'TAG' },
            { transient: { includeWeight: false } },
          ),
        ],
      })

      const result = transformIndexInfo(apiResponse)

      expect(result.attributes[0].weight).toBeUndefined()
    })

    it('should normalize all field types to lowercase', () => {
      const apiResponse = indexInfoFactory.build({
        attributes: [
          indexInfoAttributeFactory.build({ type: 'TEXT' }),
          indexInfoAttributeFactory.build({ type: 'TAG' }),
          indexInfoAttributeFactory.build({ type: 'NUMERIC' }),
        ],
      })

      const result = transformIndexInfo(apiResponse)

      expect(result.attributes[0].type).toBe('text')
      expect(result.attributes[1].type).toBe('tag')
      expect(result.attributes[2].type).toBe('numeric')
    })
  })
})
