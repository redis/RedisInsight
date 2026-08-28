// NOTE: constructKeysToTree keeps its own inline copy of this function —
// it is stringified into a Web Worker Blob by useDisposableWebworker, so it
// cannot reference this module. Keep both implementations in sync.
//
// Splits a key name into the parts that become tree levels.
//
// Two things stop a delimiter from being a split point:
//   - it starts before `pLength`, so the first level always spans at least the
//     requested prefix (the existing "prefix length" tree setting);
//   - it falls inside a Redis hash tag, so a hash tag spanning several
//     delimiter-separated groups stays in one tree node instead of being torn
//     apart (e.g. `{portal2:co}:something`).
//
// The hash tag is resolved exactly like Redis does in `keyHashSlot` (cluster.c):
// the first `{`, then the first `}` after it, and only when there is at least
// one character in between. Key names without such a span — no braces,
// unbalanced braces, an empty `{}` — are split as before.
export const splitWithPrefixThreshold = (
  name: string,
  dPattern: string,
  pLength: number,
): string[] => {
  const tagStart = name.indexOf('{')
  const tagEnd = tagStart === -1 ? -1 : name.indexOf('}', tagStart + 1)
  const hasHashTag = tagEnd > tagStart + 1

  if (!hasHashTag || !dPattern) {
    if (!pLength) {
      return name.split(new RegExp(dPattern, 'g'))
    }
    const prefix = name.substring(0, pLength)
    const rest = name.substring(pLength)
    const restParts = rest.split(new RegExp(dPattern, 'g'))
    return [prefix + restParts[0], ...restParts.slice(1)]
  }

  const regex = new RegExp(dPattern, 'g')
  const parts: string[] = []
  let partStart = 0
  let match = regex.exec(name)

  while (match !== null) {
    const { length } = match[0]

    if (length === 0) {
      // never let a zero-length match stall the scan
      regex.lastIndex += 1
    } else if (
      match.index >= pLength &&
      (match.index <= tagStart || match.index + length > tagEnd)
    ) {
      parts.push(name.slice(partStart, match.index))
      partStart = match.index + length
    }

    match = regex.exec(name)
  }

  parts.push(name.slice(partStart))

  return parts
}
