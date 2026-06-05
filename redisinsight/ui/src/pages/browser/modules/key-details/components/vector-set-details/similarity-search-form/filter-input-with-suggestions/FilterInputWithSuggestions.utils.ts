import { ActiveDotToken } from './FilterInputWithSuggestions.types'

const WORD_CHAR = /[A-Za-z0-9_]/
const DOT_TOKEN_BODY = /^[A-Za-z0-9_]*$/

export const isWordChar = (ch: string): boolean => WORD_CHAR.test(ch)

/**
 * Resolve the `.attribute` token actively being typed before the caret, or
 * `null` if none. Decimal numbers like `3.14` and tokens broken by non-word
 * characters do not match.
 */
export const findActiveDotToken = (
  value: string,
  caret: number,
): ActiveDotToken | null => {
  if (caret <= 0) return null
  let i = caret - 1
  while (i >= 0) {
    const ch = value[i]
    if (ch === '.') {
      const before = i === 0 ? '' : value[i - 1]
      if (before !== '' && isWordChar(before)) return null
      const prefix = value.substring(i + 1, caret)
      if (!DOT_TOKEN_BODY.test(prefix)) return null
      return { dotIndex: i, prefix }
    }
    if (!isWordChar(ch)) return null
    i -= 1
  }
  return null
}

/**
 * Collect every fully-typed `.attribute` token in `value`. The token whose dot
 * sits at `excludeDotIndex` (the one currently being edited) is skipped.
 */
export const findUsedAttributeKeys = (
  value: string,
  excludeDotIndex?: number,
): Set<string> => {
  const used = new Set<string>()
  for (const match of value.matchAll(/(^|[^A-Za-z0-9_])\.([A-Za-z0-9_]+)/g)) {
    const dotIndex = (match.index ?? 0) + match[1].length
    if (dotIndex === excludeDotIndex) continue
    used.add(match[2])
  }
  return used
}
