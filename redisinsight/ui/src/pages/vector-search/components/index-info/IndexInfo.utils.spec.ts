import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import {
  indexInfoFactory,
  indexAttributeFactory,
} from 'uiSrc/mocks/factories/vector-search/indexInfo.factory'

import {
  parseIndexAttributes,
  formatOptions,
  hasIndexOptions,
} from './IndexInfo.utils'
import { getPresentBooleanFlags } from './IndexInfo.constants'

describe('IndexInfo.utils', () => {
  describe('parseIndexAttributes', () => {
    it('should parse attributes to table-friendly format', () => {
      const indexInfo = indexInfoFactory.build()

      const result = parseIndexAttributes(indexInfo)

      expect(result).toHaveLength(indexInfo.attributes.length)
      expect(result[0].identifier).toBe(indexInfo.attributes[0].identifier)
      expect(result[0].attribute).toBe(indexInfo.attributes[0].attribute)
      expect(result[0].type).toBe(indexInfo.attributes[0].type)
    })

    it('should handle empty attributes array', () => {
      const indexInfo = indexInfoFactory.build({ attributes: [] })

      const result = parseIndexAttributes(indexInfo)

      expect(result).toEqual([])
    })

    it('should handle attributes without weight', () => {
      const indexInfo = indexInfoFactory.build({
        attributes: [
          indexAttributeFactory.build(
            { type: FieldTypes.TAG },
            { transient: { includeWeight: false } },
          ),
        ],
      })

      const result = parseIndexAttributes(indexInfo)

      expect(result[0].weight).toBeUndefined()
    })

    it('should flatten boolean flags onto table rows', () => {
      const indexInfo = indexInfoFactory.build({
        attributes: [
          indexAttributeFactory.build({
            type: FieldTypes.TEXT,
            flags: { WITHSUFFIXTRIE: true, NOSTEM: true },
          }),
        ],
      })

      const result = parseIndexAttributes(indexInfo)

      expect(result[0].WITHSUFFIXTRIE).toBe(true)
      expect(result[0].NOSTEM).toBe(true)
      expect(result[0].SORTABLE).toBeUndefined()
    })
  })

  describe('getPresentBooleanFlags', () => {
    it('should return flags present on any row in canonical order', () => {
      const rows = parseIndexAttributes(
        indexInfoFactory.build({
          attributes: [
            indexAttributeFactory.build({
              flags: { WITHSUFFIXTRIE: true, INDEXMISSING: true },
            }),
            indexAttributeFactory.build({
              flags: { SORTABLE: true },
            }),
          ],
        }),
      )

      expect(getPresentBooleanFlags(rows)).toEqual([
        'SORTABLE',
        'WITHSUFFIXTRIE',
        'INDEXMISSING',
      ])
    })

    it('should return empty list when no boolean flags are present', () => {
      const rows = parseIndexAttributes(indexInfoFactory.build())

      expect(getPresentBooleanFlags(rows)).toEqual([])
    })
  })

  describe('formatOptions', () => {
    it('should format filter option', () => {
      const options = { filter: '@status == "active"' }

      expect(formatOptions(options)).toBe('filter: @status == "active"')
    })

    it('should format language option', () => {
      const options = { defaultLang: 'german' }

      expect(formatOptions(options)).toBe('language: german')
    })

    it('should format both options with comma separator', () => {
      const options = {
        filter: '@status == "active"',
        defaultLang: 'german',
      }

      expect(formatOptions(options)).toBe(
        'filter: @status == "active", language: german',
      )
    })

    it('should return empty string when no options', () => {
      const options = {}

      expect(formatOptions(options)).toBe('')
    })
  })

  describe('hasIndexOptions', () => {
    it('should return true when filter is present', () => {
      expect(hasIndexOptions({ filter: '@status == "active"' })).toBe(true)
    })

    it('should return true when defaultLang is present', () => {
      expect(hasIndexOptions({ defaultLang: 'german' })).toBe(true)
    })

    it('should return true when both options are present', () => {
      expect(
        hasIndexOptions({
          filter: '@status == "active"',
          defaultLang: 'german',
        }),
      ).toBe(true)
    })

    it('should return false for empty object', () => {
      expect(hasIndexOptions({})).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(hasIndexOptions(undefined)).toBe(false)
    })
  })
})
