/**
 * Redis array indexes are unsigned 64-bit integers in the range
 * [0, 2^64−1) (max valid is 2^64−2) and exceed Number.MAX_SAFE_INTEGER,
 * so they stay numeric strings end-to-end — never parseInt/Number,
 * no JS-side arithmetic on indexes; Redux stores them as strings.
 *
 * Mirrored in redisinsight/api/src/common/utils/array-index.helper.ts —
 * keep semantics and tests in sync.
 */
// 2^64 - 2 — Redis accepts indexes in the half-open range [0, 2^64-1),
// so the max valid index is 2^64-2 (2^64-1 is reserved). BigInt() call
// form (not a literal) for parity with the API mirror, whose tsconfig
// targets es2019 (where BigInt literals are TS2737).
export const ARRAY_INDEX_MAX = BigInt('18446744073709551614')

const ARRAY_INDEX_REGEX = /^\d+$/

// Max u64 is 20 digits; longer all-digit inputs can't be valid and a length
// guard keeps BigInt() from parsing arbitrarily large request payloads.
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
