// NOTE: constructKeysToTree keeps its own inline copy of this function —
// it is stringified into a Web Worker Blob by useDisposableWebworker, so it
// cannot reference this module. Keep both implementations in sync.
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
  regex.lastIndex = pLength
  const parts: string[] = []
  let partStart = 0
  let match = regex.exec(name)

  while (match !== null) {
    const { length } = match[0]

    if (length === 0) {
      regex.lastIndex += 1
    } else if (
      match.index >= pLength &&
      (match.index <= tagStart || match.index + length > tagEnd)
    ) {
      parts.push(name.slice(partStart, match.index))
      partStart = match.index + length
    } else {
      regex.lastIndex = match.index + 1
    }

    match = regex.exec(name)
  }

  parts.push(name.slice(partStart))

  return parts
}
