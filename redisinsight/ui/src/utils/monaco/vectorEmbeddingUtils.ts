import {
  ASCIIToBuffer,
  bufferToFloat32Array,
  isBinaryVector,
} from '../formatters/bufferFormatters'
import { splitQueryByArgs } from './monacoUtils'
import {
  VectorEmbeddingFormat,
  VectorEmbeddingMark,
} from './vectorEmbeddingUtils.types'

export const MIN_VECTOR_ARRAY_ELEMENTS = 10
export const FLOAT32_BYTES = 4

const PREVIEW_HEAD = 3
const PREVIEW_TAIL = 2

const QUOTED_STRING_REGEX = /"(?:\\.|[^"\\])*"/g
const NUMERIC_ARRAY_REGEX = /\[[\s\d.,eE+-]+\]/g

const stripQuotes = (token: string): string => token.replace(/^["']|["']$/g, '')

// The tokenizer drops escape backslashes, so normalise both sides before
// matching a mark against a PARAMS value token.
const normaliseForParamMatch = (value: string): string =>
  stripQuotes(value).replace(/\\/g, '')

// Maps each FT.SEARCH/FT.AGGREGATE PARAMS value to its argument name.
const buildParamNameLookup = (query: string): Map<string, string> => {
  const { args } = splitQueryByArgs(query)
  const tokens = args.flat()
  const lookup = new Map<string, string>()

  const paramsIndex = tokens.findIndex((t) => t.toUpperCase() === 'PARAMS')
  if (paramsIndex === -1) return lookup

  const declaredCount = Number(tokens[paramsIndex + 1])
  const pairs =
    Number.isInteger(declaredCount) && declaredCount > 0
      ? declaredCount
      : Math.floor((tokens.length - (paramsIndex + 2)) / 2)

  for (let pair = 0; pair < pairs; pair++) {
    const name = tokens[paramsIndex + 2 + pair * 2]
    const value = tokens[paramsIndex + 3 + pair * 2]
    if (name === undefined || value === undefined) break
    lookup.set(normaliseForParamMatch(value), stripQuotes(name))
  }

  return lookup
}

/**
 * Scans query text and returns a mark for every large vector embedding:
 * binary FLOAT32 `\x` blobs (validated by `isBinaryVector`) and numeric
 * arrays with at least `MIN_VECTOR_ARRAY_ELEMENTS` elements. Pure and
 * source-agnostic; results are ordered by position.
 */
export const detectVectorEmbeddings = (
  query: string,
): VectorEmbeddingMark[] => {
  const marks: VectorEmbeddingMark[] = []

  const stringRegex = new RegExp(QUOTED_STRING_REGEX)
  let match: RegExpExecArray | null
  // eslint-disable-next-line no-cond-assign
  while ((match = stringRegex.exec(query)) !== null) {
    const body = match[0].slice(1, -1)
    if (!body.includes('\\x')) continue

    const buffer = ASCIIToBuffer(body)
    if (!isBinaryVector(buffer)) continue

    const values = Array.from(bufferToFloat32Array(new Uint8Array(buffer.data)))
    marks.push({
      range: { start: match.index, end: match.index + match[0].length },
      format: VectorEmbeddingFormat.BinaryString,
      byteSize: buffer.data.length,
      dimensions: buffer.data.length / FLOAT32_BYTES,
      firstValues: values.slice(0, PREVIEW_HEAD),
      lastValues: values.slice(-PREVIEW_TAIL),
    })
  }

  const arrayRegex = new RegExp(NUMERIC_ARRAY_REGEX)
  // eslint-disable-next-line no-cond-assign
  while ((match = arrayRegex.exec(query)) !== null) {
    const parts = match[0]
      .slice(1, -1)
      .split(',')
      .map((part) => part.trim())

    if (parts.length < MIN_VECTOR_ARRAY_ELEMENTS) continue
    if (!parts.every((part) => part !== '' && Number.isFinite(Number(part))))
      continue

    const values = parts.map(Number)
    marks.push({
      range: { start: match.index, end: match.index + match[0].length },
      format: VectorEmbeddingFormat.FloatArray,
      byteSize: values.length * FLOAT32_BYTES,
      dimensions: values.length,
      firstValues: values.slice(0, PREVIEW_HEAD),
      lastValues: values.slice(-PREVIEW_TAIL),
    })
  }

  const paramNames = buildParamNameLookup(query)
  if (paramNames.size > 0) {
    marks.forEach((mark) => {
      const raw = query.slice(mark.range.start, mark.range.end)
      const name = paramNames.get(normaliseForParamMatch(raw))
      if (name !== undefined) mark.paramName = name
    })
  }

  return marks.sort((a, b) => a.range.start - b.range.start)
}
