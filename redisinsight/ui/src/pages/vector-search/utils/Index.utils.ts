/**
 * Formats prefixes array for display.
 * Joins prefixes with comma and wraps each in quotes.
 */
export const formatPrefixes = (prefixes: string[] | undefined): string => {
  if (!prefixes || prefixes.length === 0) {
    return ''
  }

  return prefixes.map((prefix) => `"${prefix}"`).join(', ')
}
