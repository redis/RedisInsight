/**
 * Stride of `VSIM ... WITHSCORES WITHATTRIBS` replies. The flat reply array
 * contains 3 entries per match in the order `(name, score, attributes|null)`.
 */
export const VSIM_REPLY_STRIDE = 3;

/**
 * Stride of `VSIM ... WITHSCORES` replies (without WITHATTRIBS). The flat
 * reply array contains 2 entries per match in the order `(name, score)`. Used
 * on Redis 8.0.0–8.0.2 where WITHATTRIBS is not supported and attributes have
 * to be retrieved per-element via VGETATTR after the search returns.
 */
export const VSIM_REPLY_STRIDE_NO_ATTRIBS = 2;

/**
 * Literal Redis-protocol tokens used when building VADD / VSIM commands.
 * Centralised here so the executable command builder, the preview formatter,
 * and any future caller stay aligned on the exact wire-format spelling and
 * cannot drift between Buffer / string mismatches or stray typos.
 */
export const VECTOR_SET_TOKENS = Object.freeze({
  // Query-mode tokens for VADD / VSIM
  ELE: 'ELE',
  VALUES: 'VALUES',
  FP32: 'FP32',
  // VADD attribute clause
  SETATTR: 'SETATTR',
  // VSIM modifier clauses
  COUNT: 'COUNT',
  WITHSCORES: 'WITHSCORES',
  WITHATTRIBS: 'WITHATTRIBS',
  FILTER: 'FILTER',
} as const);
