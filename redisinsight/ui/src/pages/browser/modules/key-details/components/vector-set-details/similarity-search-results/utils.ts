const PERCENT_PRECISION = 2
const PERCENT_FACTOR = 100

/**
 * Format a raw similarity score (typically in `[0, 1]`) as a fixed-precision
 * percentage string, e.g. `0.9999 -> "99.99 %"`. Out-of-range or non-finite
 * scores fall back to a dash so the table never renders `NaN %`.
 */
export const formatSimilarity = (score: number): string => {
  if (!Number.isFinite(score)) return '—'
  return `${(score * PERCENT_FACTOR).toFixed(PERCENT_PRECISION)} %`
}
