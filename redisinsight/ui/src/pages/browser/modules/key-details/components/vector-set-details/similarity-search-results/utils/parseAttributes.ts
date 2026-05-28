import { VectorSetSimilarityMatch } from 'uiSrc/slices/interfaces/vectorSet'
import { ParsedAttributesCache } from '../SimilaritySearchResultsTable.types'

/** Parse a match's `attributes` JSON string; returns `{}` on any failure. */
export const parseAttributes = (
  raw: string | undefined | null,
): Record<string, unknown> => {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    if (
      parsed === null ||
      typeof parsed !== 'object' ||
      Array.isArray(parsed)
    ) {
      return {}
    }
    return parsed as Record<string, unknown>
  } catch {
    return {}
  }
}

/**
 * Build a `WeakMap<match, parsedAttributes>` so callers (key-collector + table
 * cells) can share a single JSON-parse per match.
 */
export const buildParsedAttributesCache = (
  matches: VectorSetSimilarityMatch[],
): ParsedAttributesCache => {
  const cache: ParsedAttributesCache = new WeakMap()
  for (const match of matches) {
    cache.set(match, parseAttributes(match.attributes))
  }
  return cache
}

/**
 * Memoized `parseAttributes` for callers that can't reach
 * `meta.parsedAttributesCache` (tanstack `accessorFn` / `sortingFn` don't
 * receive the table), so sorting doesn't re-parse on every comparison.
 */
const moduleParsedAttributesCache: WeakMap<
  VectorSetSimilarityMatch,
  Record<string, unknown>
> = new WeakMap()

export const getParsedAttributes = (
  match: VectorSetSimilarityMatch,
): Record<string, unknown> => {
  const cached = moduleParsedAttributesCache.get(match)
  if (cached) return cached
  const parsed = parseAttributes(match.attributes)
  moduleParsedAttributesCache.set(match, parsed)
  return parsed
}

/**
 * Union of top-level attribute keys across `matches`, alphabetically sorted.
 * Stable ordering keeps the column list referentially stable across renders.
 *
 * Pass a pre-built `cache` to avoid re-parsing `attributes` strings here.
 */
export const collectAttributeKeys = (
  matches: VectorSetSimilarityMatch[],
  cache?: ParsedAttributesCache,
): string[] => {
  const keys = new Set<string>()
  for (const match of matches) {
    const attrs = cache?.get(match) ?? parseAttributes(match.attributes)
    for (const key of Object.keys(attrs)) {
      keys.add(key)
    }
  }
  return Array.from(keys).sort()
}

/** Stringify an attribute value for table-cell display. */
export const renderAttributeValue = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return ''
    }
  }
  return String(value)
}
