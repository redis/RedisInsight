/**
 * Parse a vector set element's `attributes` JSON string and return its
 * top-level keys. Returns `[]` for any non-JSON, non-object, or array value
 * so callers can union safely without guarding for malformed payloads.
 */
export const extractAttributeKeys = (
  raw: string | undefined | null,
): string[] => {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed))
      return []
    return Object.keys(parsed as Record<string, unknown>)
  } catch {
    return []
  }
}

/**
 * Union the alphabetically-sorted top-level attribute keys across `existing`
 * and the keys discovered in `items`. Stable order keeps memoized consumers
 * (e.g. the similarity-search filter dropdown) referentially stable when no
 * new keys appear.
 */
export const mergeAttributeKeys = (
  existing: string[],
  items: { attributes?: string }[],
): string[] => {
  const set = new Set(existing)
  for (const item of items) {
    for (const key of extractAttributeKeys(item.attributes)) {
      set.add(key)
    }
  }
  if (set.size === existing.length) return existing
  return Array.from(set).sort()
}
