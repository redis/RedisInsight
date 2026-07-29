import { safeUrl } from 'uiSrc/utils/formatters/markdown/safeUrl'

describe('safeUrl', () => {
  it.each([
    'https://redis.io',
    'http://localhost:5540/x',
    'mailto:support@redis.io',
    '/relative/path',
    './doc.md',
    'image.png',
    '#anchor',
  ])('allows %s', (url) => {
    expect(safeUrl(url)).toBe(url)
  })

  it.each([
    'javascript:alert(1)',
    'JAVASCRIPT:alert(1)',
    ' javascript:alert(1)',
    'java\tscript:alert(1)',
    'java\nscript:alert(1)',
    '\tjavascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    '//evil.com/x',
    '//evil.com',
  ])('blocks %s', (url) => {
    expect(safeUrl(url)).toBe('')
  })
})
