import { queryLibraryItemFactory } from 'uiSrc/mocks/factories/query-library/queryLibraryItem.factory'
import { QueryLibraryType } from 'uiSrc/services/query-library/types'

import { buildLoadQuery } from './QueryLibraryView.utils'

describe('buildLoadQuery', () => {
  it('should prepend description as comment for sample query with description', () => {
    const item = queryLibraryItemFactory.build({
      type: QueryLibraryType.Sample,
    })

    expect(buildLoadQuery(item)).toBe(`// ${item.description}\n${item.query}`)
  })

  it('should return query as-is for sample query without description', () => {
    const item = queryLibraryItemFactory.build({
      type: QueryLibraryType.Sample,
      description: undefined,
    })

    expect(buildLoadQuery(item)).toBe(item.query)
  })

  it('should return query as-is for sample query with empty description', () => {
    const item = queryLibraryItemFactory.build({
      type: QueryLibraryType.Sample,
      description: '',
    })

    expect(buildLoadQuery(item)).toBe(item.query)
  })

  it('should return query as-is for saved query', () => {
    const item = queryLibraryItemFactory.build({
      type: QueryLibraryType.Saved,
      description: undefined,
    })

    expect(buildLoadQuery(item)).toBe(item.query)
  })
})
