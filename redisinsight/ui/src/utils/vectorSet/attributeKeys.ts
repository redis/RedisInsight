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

// Returns the same reference when no new keys are added so memoized consumers
// stay stable across paginated loads.
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
