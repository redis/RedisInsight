export const formatVector = (
  vector?: number[],
  truncated?: boolean,
): string => {
  if (!vector?.length) return '[]'

  const formatted = `[${vector.join(', ')}`
  return truncated ? `${formatted}, ...]` : `${formatted}]`
}
