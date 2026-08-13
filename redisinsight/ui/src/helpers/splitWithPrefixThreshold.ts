// NOTE: constructKeysToTree keeps its own inline copy of this function —
// it is stringified into a Web Worker Blob by useDisposableWebworker, so it
// cannot reference this module. Keep both implementations in sync.
export const splitWithPrefixThreshold = (
  name: string,
  dPattern: string,
  pLength: number,
): string[] => {
  if (!pLength) {
    return name.split(new RegExp(dPattern, 'g'))
  }
  const prefix = name.substring(0, pLength)
  const rest = name.substring(pLength)
  const restParts = rest.split(new RegExp(dPattern, 'g'))
  return [prefix + restParts[0], ...restParts.slice(1)]
}
