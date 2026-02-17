import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import {
  indexInfoFactory,
  indexAttributeFactory,
} from 'uiSrc/mocks/factories/vector-search/indexInfo.factory'

import { transformIndexListRow } from './useIndexListData.utils'

describe('useIndexListData.utils', () => {
  describe('transformIndexListRow', () => {
    it('should transform IndexInfo to IndexListRow', () => {
      const info = indexInfoFactory.build()

      const result = transformIndexListRow('my-index', info)

      expect(result).toEqual({
        id: 'my-index',
        name: 'my-index',
        prefixes: info.indexDefinition.prefixes,
        fieldTypes: [...new Set(info.attributes.map((a) => a.type))],
        numDocs: info.numDocs,
        numRecords: info.numRecords,
        numTerms: info.numTerms,
        numFields: info.attributes.length,
      })
    })

    it('should deduplicate field types', () => {
      const info = indexInfoFactory.build({
        attributes: [
          indexAttributeFactory.build({ type: FieldTypes.TEXT }),
          indexAttributeFactory.build({ type: FieldTypes.TEXT }),
          indexAttributeFactory.build({ type: FieldTypes.TAG }),
        ],
      })

      const result = transformIndexListRow('idx', info)

      expect(result.fieldTypes).toEqual([FieldTypes.TEXT, FieldTypes.TAG])
    })

    it('should handle empty attributes', () => {
      const info = indexInfoFactory.build({ attributes: [] })

      const result = transformIndexListRow('idx', info)

      expect(result.fieldTypes).toEqual([])
      expect(result.numFields).toBe(0)
    })
  })
})
