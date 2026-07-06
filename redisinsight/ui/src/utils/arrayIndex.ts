/**
 * Redis array indexes travel as numeric strings end-to-end (u64 exceeds
 * Number.MAX_SAFE_INTEGER) — never parseInt/Number; Redux stores them as
 * strings. Mirrored in redisinsight/api/src/common/utils/array-index.helper.ts
 * — keep in sync.
 */
// Max valid Redis array index — half-open [0, 2^64−1), so 2^64−2.
export const ARRAY_INDEX_MAX = BigInt('18446744073709551614')

const ARRAY_INDEX_REGEX = /^\d+$/

// 20-digit guard so BigInt() can't parse arbitrarily long payloads.
const ARRAY_INDEX_MAX_LENGTH = 20

/**
 * Returns the canonical decimal string for a valid index ("007" → "7"),
 * or null for anything else (empty or whitespace-only, negative,
 * fractional, exponent, hex, > 2^64−2, non-string input).
 */
export const parseArrayIndex = (input: unknown): string | null => {
  if (typeof input !== 'string') {
    return null
  }

  const value = input.trim()
  if (!ARRAY_INDEX_REGEX.test(value)) {
    return null
  }

  if (value.length > ARRAY_INDEX_MAX_LENGTH) {
    return null
  }

  const index = BigInt(value)
  return index > ARRAY_INDEX_MAX ? null : index.toString()
}

export const isValidArrayIndex = (input: unknown): boolean =>
  parseArrayIndex(input) !== null

/**
 * Inclusive ±count index window around a match, for the search context
 * band. Clamps the lower bound at 0 (no negative indexes) and the upper
 * bound at ARRAY_INDEX_MAX. All math in BigInt to stay exact past 2^53.
 */
export const getNeighbourRange = (
  index: string,
  count: number,
): { start: string; end: string } => {
  // Coerce count to a non-negative integer: a fractional/NaN value would make
  // BigInt() throw and break the caller mid-render.
  const span = BigInt(
    Number.isFinite(count) ? Math.max(0, Math.trunc(count)) : 0,
  )
  const center = BigInt(index)
  const lower = center - span
  const upper = center + span
  return {
    start: (lower < BigInt(0) ? BigInt(0) : lower).toString(),
    end: (upper > ARRAY_INDEX_MAX ? ARRAY_INDEX_MAX : upper).toString(),
  }
}
