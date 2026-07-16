import {
  ASCIIToBuffer,
  bufferToFloat32Array,
  isBinaryVector,
} from '../formatters/bufferFormatters'
import { splitQueryByArgs } from './monacoUtils'

/**
 * Vector embeddings are stored either as a quoted binary FLOAT32 blob
 * (`\x`-escaped bytes) or as a plain numeric array literal. Detection
 * thresholds live here so callers stay declarative.
 */
export const MIN_VECTOR_ARRAY_ELEMENTS = 10 // epic threshold for numeric arrays
export const FLOAT32_BYTES = 4

/** Number of leading/trailing values kept for a compact preview. */
const PREVIEW_HEAD = 3
const PREVIEW_TAIL = 2

/** Matches a double-quoted string literal, honouring backslash escapes. */
const QUOTED_STRING_REGEX = /"(?:\\.|[^"\\])*"/g
/** Matches a bracketed list of numbers, tolerant of whitespace after commas. */
const NUMERIC_ARRAY_REGEX = /\[[\s\d.,eE+-]+\]/g

export enum VectorEmbeddingFormat {
  BinaryString = 'binaryString',
  FloatArray = 'floatArray',
}

export interface VectorEmbeddingMark {
  /** Character offsets into the scanned query string. */
  range: { start: number; end: number }
  format: VectorEmbeddingFormat
  /** FLOAT32 is assumed for both formats (byte size = dimensions * 4). */
  byteSize: number
  dimensions: number
  /** First few values, for a compact preview. */
  firstValues: number[]
  /** Last few values, for a compact preview. */
  lastValues: number[]
  /** FT.SEARCH `PARAMS` argument name, when the blob is passed as a param value. */
  paramName?: string
}

/** Strips a single pair of surrounding single/double quotes. */
const stripQuotes = (token: string): string => token.replace(/^["']|["']$/g, '')

/**
 * Normalises a token for comparison against a detected mark: removes escape
 * backslashes (the tokenizer drops them) and surrounding quotes, so a
 * `"\x00\x00..."` mark matches the corresponding `PARAMS` value token.
 */
const normaliseForParamMatch = (value: string): string =>
  stripQuotes(value).replace(/\\/g, '')

/**
 * Builds a lookup from `PARAMS` value → argument name for an FT.SEARCH /
 * FT.AGGREGATE query. Locates the clause via {@link splitQueryByArgs} rather
 * than the Workbench `[…]` params line. Returns an empty map when there is no
 * `PARAMS` clause.
 */
const buildParamNameLookup = (query: string): Map<string, string> => {
  const { args } = splitQueryByArgs(query)
  const tokens = args.flat()
  const lookup = new Map<string, string>()

  const paramsIndex = tokens.findIndex((t) => t.toUpperCase() === 'PARAMS')
  if (paramsIndex === -1) return lookup

  // `PARAMS <count> name value name value …`; fall back to reading every
  // trailing pair when the count is missing or malformed.
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
 * Scans query text and returns a mark for every large vector embedding it
 * contains. Pure and source-agnostic: it reacts to whatever text is passed,
 * covering typing, pasting, tutorials, history, saved queries and restored
 * content alike. Two formats are recognised:
 *  - quoted binary FLOAT32 blobs (`\x`-escaped), gated by `isBinaryVector`;
 *  - numeric array literals with at least `MIN_VECTOR_ARRAY_ELEMENTS` elements.
 * All occurrences are marked; results are ordered by position.
 */
export const detectVectorEmbeddings = (
  query: string,
): VectorEmbeddingMark[] => {
  const marks: VectorEmbeddingMark[] = []

  // Binary FLOAT32 strings: "\x.." blobs validated with the buffer heuristic.
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

  // Numeric array literals: [0.1, 0.2, …] with enough finite elements.
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

  // Attach PARAMS argument names where a blob is passed as a param value.
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
