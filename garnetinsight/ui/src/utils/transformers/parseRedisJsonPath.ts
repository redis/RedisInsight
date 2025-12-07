// Matches [number] or ['string'] / ["string"] segments (with support for escaped characters inside strings)
const REGEX = /\[(?:(["'])((?:\\.|(?!\1).)*)\1|(\d+))\]/g

/**
 * Parses a Redis JSONPath string into lodash.get compatible path chunks.
 * Supports both numeric indices and JSON string keys (single or double quoted).
 *
 * Example: $['foo'][0]["bar"] => ['foo', 0, 'bar']
 */

const parseRedisJsonPath = (path: string): (string | number)[] => {
  if (typeof path !== 'string') throw new TypeError('Path must be a string')

  const matches = Array.from(path.matchAll(REGEX))

  const chunks: (string | number)[] = []
  let lastIndex = 0

  if (path.startsWith('$')) {
    lastIndex = 1
  }

  matches.forEach((match) => {
    if (match.index !== lastIndex) {
      throw new SyntaxError(
        `Invalid segment at position ${lastIndex}: "${path.slice(lastIndex)}"`,
      )
    }

    const [, quote, strContent, numContent] = match

    // Assumming the path will be created from wrapPath()
    // no need to handle the JSON encodings
    if (quote) {
      const jsonStr = `"${strContent}"`
      chunks.push(JSON.parse(jsonStr))
    } else if (numContent) {
      chunks.push(Number(numContent))
    }

    lastIndex = match.index! + match[0].length
  })

  if (lastIndex !== path.length) {
    throw new SyntaxError(
      `Unexpected trailing content starting at position ${lastIndex}: "${path.slice(lastIndex)}"`,
    )
  }

  return chunks
}

export default parseRedisJsonPath
