import { decodeEscapedText, isProbablyMarkdown } from 'uiSrc/utils'

describe('markdownText formatters', () => {
  describe('decodeEscapedText', () => {
    it('decodes escaped line breaks and utf8 hex byte sequences', () => {
      expect(
        decodeEscapedText(
          '# AFS Architecture\\n\\n## Three layers\\nRedis \\xe2\\x80\\x94 fast',
        ),
      ).toEqual('# AFS Architecture\n\n## Three layers\nRedis — fast')
    })

    it('decodes escaped quotes and unicode escapes', () => {
      expect(decodeEscapedText('\\"\\"\\"Hello\\u2014world\\"\\"\\"')).toEqual(
        '"""Hello—world"""',
      )
    })
  })

  describe('isProbablyMarkdown', () => {
    it('detects markdown headings and lists', () => {
      expect(
        isProbablyMarkdown('# Title\n\n## Section\n\n1. First\n2. Second'),
      ).toBe(true)
    })

    it('does not flag ordinary prose as markdown', () => {
      expect(isProbablyMarkdown('A normal sentence with punctuation.')).toBe(
        false,
      )
    })
  })
})
