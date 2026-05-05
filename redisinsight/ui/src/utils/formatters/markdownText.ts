import { TextDecoder } from 'text-encoding'

const hexEscapeRun = /(?:\\x[0-9a-fA-F]{2})+/g
const hexEscape = /\\x([0-9a-fA-F]{2})/g
const unicodeEscape = /\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})/g

export const decodeEscapedText = (value: string): string =>
  value
    .replace(hexEscapeRun, (match) => {
      const bytes = Array.from(match.matchAll(hexEscape), ([, byte]) =>
        parseInt(byte, 16),
      )

      return new TextDecoder('utf-8').decode(new Uint8Array(bytes))
    })
    .replace(unicodeEscape, (_match, codePoint, codeUnit) =>
      String.fromCodePoint(parseInt(codePoint || codeUnit, 16)),
    )
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")

export const isProbablyMarkdown = (value: string): boolean => {
  const text = value.trim()

  if (!text) {
    return false
  }

  const blockPatterns = [
    /^#{1,6}\s+\S/m,
    /^-{3,}\s*$/m,
    /^```/m,
    /^>\s+\S/m,
    /^\s*[-*+]\s+\S/m,
    /^\s*\d+\.\s+\S/m,
    /^\|.+\|\s*$/m,
  ]

  if (blockPatterns.some((pattern) => pattern.test(text))) {
    return true
  }

  const inlinePatterns = [/\*\*[^*\n]+\*\*/, /`[^`\n]+`/, /\[[^\]]+\]\([^)]+\)/]

  return inlinePatterns.filter((pattern) => pattern.test(text)).length > 1
}
