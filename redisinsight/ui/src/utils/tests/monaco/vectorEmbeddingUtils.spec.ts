import {
  detectVectorEmbeddings,
  MIN_VECTOR_ARRAY_ELEMENTS,
  VectorEmbeddingFormat,
} from 'uiSrc/utils'
import {
  FP32_INVALID_BYTE_LENGTH_INPUT,
  FP32_VECTOR_FIXTURE_1_2_3,
} from 'uiSrc/mocks/factories/browser/vectorSet/vectorSetElement.factory'

const { escaped: FP32_ESCAPED } = FP32_VECTOR_FIXTURE_1_2_3

/** Builds a `[a, b, c, …]` literal with `count` sequential float values. */
const buildArrayLiteral = (count: number): string =>
  `[${Array.from({ length: count }, (_, i) => i).join(', ')}]`

describe('detectVectorEmbeddings', () => {
  it('returns no marks for an empty or plain query', () => {
    expect(detectVectorEmbeddings('')).toEqual([])
    expect(detectVectorEmbeddings('FT.SEARCH idx "hello world"')).toEqual([])
  })

  describe('numeric arrays', () => {
    it('marks an array with at least the minimum number of elements', () => {
      const query = `FT.SEARCH idx ${buildArrayLiteral(12)}`
      const start = query.indexOf('[')

      const marks = detectVectorEmbeddings(query)

      expect(marks).toHaveLength(1)
      expect(marks[0]).toMatchObject({
        range: { start, end: query.length },
        format: VectorEmbeddingFormat.FloatArray,
        dimensions: 12,
        byteSize: 48,
        firstValues: [0, 1, 2],
        lastValues: [10, 11],
      })
      expect(marks[0].paramName).toBeUndefined()
    })

    it('is tolerant of whitespace after commas', () => {
      const marks = detectVectorEmbeddings(buildArrayLiteral(10))
      expect(marks).toHaveLength(1)
      expect(marks[0].dimensions).toBe(10)
    })

    it.each([
      [MIN_VECTOR_ARRAY_ELEMENTS - 1, 0],
      [MIN_VECTOR_ARRAY_ELEMENTS, 1],
    ])('given %i elements, produces %i mark(s)', (count, expected) => {
      expect(detectVectorEmbeddings(buildArrayLiteral(count))).toHaveLength(
        expected,
      )
    })

    it('does not mark a bracketed list containing non-numeric values', () => {
      const query = '[a, b, c, d, e, f, g, h, i, j, k]'
      expect(detectVectorEmbeddings(query)).toEqual([])
    })
  })

  describe('binary FLOAT32 strings', () => {
    it('marks a quoted \\x blob validated by isBinaryVector', () => {
      const query = `HSET doc:1 v "${FP32_ESCAPED}"`
      const start = query.indexOf('"')

      const marks = detectVectorEmbeddings(query)

      expect(marks).toHaveLength(1)
      expect(marks[0]).toMatchObject({
        range: { start, end: query.length },
        format: VectorEmbeddingFormat.BinaryString,
        dimensions: 3,
        byteSize: 12,
        firstValues: [1, 2, 3],
        lastValues: [2, 3],
      })
    })

    it('does not mark a \\x string whose byte length fails the heuristic', () => {
      const query = `HSET doc:1 v "${FP32_INVALID_BYTE_LENGTH_INPUT}"`
      expect(detectVectorEmbeddings(query)).toEqual([])
    })

    it('does not mark a long plain quoted string without escapes', () => {
      const query = `FT.SEARCH idx "${'a'.repeat(200)}"`
      expect(detectVectorEmbeddings(query)).toEqual([])
    })
  })

  describe('multiple embeddings', () => {
    it('marks every occurrence, ordered by position', () => {
      const array = buildArrayLiteral(12)
      const query = `first ${array} then "${FP32_ESCAPED}"`

      const marks = detectVectorEmbeddings(query)

      expect(marks).toHaveLength(2)
      expect(marks.map((m) => m.format)).toEqual([
        VectorEmbeddingFormat.FloatArray,
        VectorEmbeddingFormat.BinaryString,
      ])
      expect(marks[0].range.start).toBeLessThan(marks[1].range.start)
    })
  })

  describe('PARAMS argument name', () => {
    it('attaches the PARAMS name to a blob passed as a param value', () => {
      const query = `FT.SEARCH idx "*=>[KNN 3 @v $BLOB]" PARAMS 2 BLOB "${FP32_ESCAPED}" DIALECT 2`

      const marks = detectVectorEmbeddings(query)

      expect(marks).toHaveLength(1)
      expect(marks[0].format).toBe(VectorEmbeddingFormat.BinaryString)
      expect(marks[0].paramName).toBe('BLOB')
    })

    it('leaves paramName undefined outside a PARAMS clause', () => {
      const marks = detectVectorEmbeddings(`HSET doc:1 v "${FP32_ESCAPED}"`)
      expect(marks[0].paramName).toBeUndefined()
    })

    it('treats PARAMS nargs as a token count, not a pair count', () => {
      // nargs=2 -> a single param (limit 10); the blob is a later, non-param value.
      const query = `FT.SEARCH idx "q" PARAMS 2 limit 10 extra "${FP32_ESCAPED}"`
      const marks = detectVectorEmbeddings(query)
      expect(marks).toHaveLength(1)
      expect(marks[0].paramName).toBeUndefined()
    })

    it('maps the name for a multi-param PARAMS clause', () => {
      // nargs=4 -> two params (topk 10, blob <embedding>).
      const query = `FT.SEARCH idx "q" PARAMS 4 topk 10 blob "${FP32_ESCAPED}" DIALECT 2`
      const marks = detectVectorEmbeddings(query)
      expect(marks).toHaveLength(1)
      expect(marks[0].paramName).toBe('blob')
    })
  })
})
