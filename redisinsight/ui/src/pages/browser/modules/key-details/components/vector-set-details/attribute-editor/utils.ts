export const isJsonValid = (text: string): boolean => {
  const trimmed = text.trim()
  if (!trimmed) return true
  try {
    JSON.parse(trimmed)
    return true
  } catch {
    return false
  }
}
