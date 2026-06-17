/**
 * Redis array indexes are unsigned 64-bit integers (0 … 2^64−1) and exceed
 * Number.MAX_SAFE_INTEGER, so they travel as numeric strings end-to-end —
 * never parseInt/Number, no JS-side arithmetic on indexes (the UI's Redux
 * store keeps them as strings too).
 *
 * Shared by the UI and the API (see src/ri-shared/README.md): the API
 * imports it relatively (it lives in the api compile root, so `nest build`
 * emits it into dist like any other api source), the UI through the
 * `riShared/*` alias (wired in redisinsight/ui/vite.config.mjs,
 * redisinsight/ui/tsconfig.json, .storybook/vite.config.ts and
 * jest.config.cjs). It must stay dependency-free and es2019-compatible —
 * BigInt('...') calls only, since BigInt literals are a syntax error
 * (TS2737) under the api's es2019 target.
 */
// 2^64 - 1
export const ARRAY_INDEX_MAX = BigInt('18446744073709551615');

const ARRAY_INDEX_REGEX = /^\d+$/;

// Max u64 is 20 digits; longer all-digit inputs can't be valid and a length
// guard keeps BigInt() from parsing arbitrarily large request payloads.
const ARRAY_INDEX_MAX_LENGTH = 20;

/**
 * Returns the canonical decimal string for a valid index ("007" → "7"),
 * or null for anything else (empty or whitespace-only, negative,
 * fractional, exponent, hex, > 2^64−1, non-string input).
 */
export const parseArrayIndex = (input: unknown): string | null => {
  if (typeof input !== 'string') {
    return null;
  }

  const value = input.trim();
  if (!ARRAY_INDEX_REGEX.test(value)) {
    return null;
  }

  if (value.length > ARRAY_INDEX_MAX_LENGTH) {
    return null;
  }

  const index = BigInt(value);
  return index > ARRAY_INDEX_MAX ? null : index.toString();
};

export const isValidArrayIndex = (input: unknown): boolean =>
  parseArrayIndex(input) !== null;
