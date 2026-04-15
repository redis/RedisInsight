export const formatVector = (vector?: number[]): string => {
  if (!vector?.length) return '[]'
  return `[${vector.join(', ')}]`
}
