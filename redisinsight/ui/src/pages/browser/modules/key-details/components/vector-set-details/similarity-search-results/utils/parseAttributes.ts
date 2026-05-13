import { VectorSetSimilarityMatch } from 'uiSrc/slices/interfaces/vectorSet'

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
 * Union of top-level attribute keys across `matches`, alphabetically sorted.
 * Stable ordering keeps the column list referentially stable across renders.
 */
export const collectAttributeKeys = (
  matches: VectorSetSimilarityMatch[],
): string[] => {
  const keys = new Set<string>()
  for (const match of matches) {
    const attrs = parseAttributes(match.attributes)
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
