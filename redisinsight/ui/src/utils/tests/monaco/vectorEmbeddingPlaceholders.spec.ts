import {
  buildVectorEmbeddingPlaceholder,
  collapseVectorEmbeddingValue,
  expandVectorEmbeddings,
  findVectorEmbeddingPlaceholders,
  resetVectorEmbeddingPlaceholders,
} from 'uiSrc/utils'

const BLOB = '"\\x01\\x02\\x03\\x04"'

describe('vector embedding placeholders', () => {
  beforeEach(() => {
    resetVectorEmbeddingPlaceholders()
  })

  it('collapsing stores the value and returns an id-carrying placeholder', () => {
    const placeholder = collapseVectorEmbeddingValue(BLOB, 3)

    expect(placeholder).toBe('[▸ vector · 3 dims #1]')
    expect(expandVectorEmbeddings(placeholder)).toBe(BLOB)
  })

  it('gives every collapsed value a distinct id, even with equal dimensions', () => {
    const first = collapseVectorEmbeddingValue('"one"', 3)
    const second = collapseVectorEmbeddingValue('"two"', 3)

    expect(first).not.toBe(second)
    expect(expandVectorEmbeddings(`${first} ${second}`)).toBe('"one" "two"')
  })

  it('expands placeholders embedded in query text', () => {
    const placeholder = collapseVectorEmbeddingValue(BLOB, 3)
    const query = `FT.SEARCH idx "q" PARAMS 2 vec ${placeholder} DIALECT 2`

    expect(expandVectorEmbeddings(query)).toBe(
      `FT.SEARCH idx "q" PARAMS 2 vec ${BLOB} DIALECT 2`,
    )
  })

  it('leaves a placeholder with an unknown value untouched', () => {
    const stale = buildVectorEmbeddingPlaceholder(99, 1536)
    expect(expandVectorEmbeddings(stale)).toBe(stale)
  })

  describe('findVectorEmbeddingPlaceholders', () => {
    it('returns ranges, visible ranges and value availability', () => {
      const placeholder = collapseVectorEmbeddingValue(BLOB, 768)
      const query = `PARAMS 2 vec ${placeholder}`
      const start = query.indexOf('[')

      const found = findVectorEmbeddingPlaceholders(query)

      expect(found).toHaveLength(1)
      expect(found[0]).toMatchObject({
        id: 1,
        dimensions: 768,
        hasValue: true,
        range: { start, end: query.length },
      })
      expect(
        query.slice(found[0].visibleRange.start, found[0].visibleRange.end),
      ).toBe('▸ vector · 768 dims')
    })

    it('finds multiple placeholders ordered by position', () => {
      const first = collapseVectorEmbeddingValue('"a"', 3)
      const second = collapseVectorEmbeddingValue('"b"', 5)
      const query = `${first} and ${second}`

      const found = findVectorEmbeddingPlaceholders(query)

      expect(found.map((p) => p.id)).toEqual([1, 2])
      expect(found[0].range.start).toBeLessThan(found[1].range.start)
    })

    it('flags a placeholder from another session as valueless', () => {
      const found = findVectorEmbeddingPlaceholders(
        buildVectorEmbeddingPlaceholder(42, 3),
      )
      expect(found[0].hasValue).toBe(false)
    })

    it('returns nothing for plain query text', () => {
      expect(findVectorEmbeddingPlaceholders('FT.SEARCH idx "q"')).toEqual([])
    })
  })
})
