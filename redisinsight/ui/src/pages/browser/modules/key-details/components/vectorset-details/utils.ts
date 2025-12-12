/**
 * Parse vector input from string to number array.
 * Accepts formats: [1.0, 2.0, 3.0] or 1.0, 2.0, 3.0
 */
export const parseVectorInput = (input: string): number[] | null => {
  try {
    const trimmed = input.trim()
    if (!trimmed) return null

    // Handle JSON array format: [1.0, 2.0, 3.0]
    if (trimmed.startsWith('[')) {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed) && parsed.every((n) => typeof n === 'number')) {
        return parsed
      }
      return null
    }

    // Handle comma-separated format: 1.0, 2.0, 3.0
    const values = trimmed.split(',').map((v) => parseFloat(v.trim()))
    if (values.every((n) => !Number.isNaN(n))) {
      return values
    }
    return null
  } catch {
    return null
  }
}
