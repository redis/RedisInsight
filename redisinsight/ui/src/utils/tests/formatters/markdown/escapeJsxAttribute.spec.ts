import { escapeJsxAttribute } from 'uiSrc/utils/formatters/markdown/escapeJsxAttribute'

describe('escapeJsxAttribute', () => {
  it('should return clean strings unchanged', () => {
    expect(escapeJsxAttribute('Upload data')).toBe('Upload data')
    expect(escapeJsxAttribute('/path/to/file.txt')).toBe('/path/to/file.txt')
  })

  it('should escape double quotes', () => {
    expect(escapeJsxAttribute('value"breakout')).toBe('value&quot;breakout')
  })

  it('should preserve ampersands for valid URLs and text', () => {
    expect(escapeJsxAttribute('https://redis.io?a=1&b=2')).toBe(
      'https://redis.io?a=1&b=2',
    )
    expect(escapeJsxAttribute('Terms & Conditions')).toBe('Terms & Conditions')
  })

  it('should escape angle brackets', () => {
    expect(escapeJsxAttribute('<img src=x>')).toBe('&lt;img src=x&gt;')
  })

  it('should escape JSX expression braces', () => {
    expect(escapeJsxAttribute('{alert(1)}')).toBe('&#123;alert(1)&#125;')
  })

  it('should neutralize JSX attribute breakout injection', () => {
    const malicious =
      'x" path="/x" /> <img src={constructor.constructor("return alert(1)")()}'
    const escaped = escapeJsxAttribute(malicious)
    expect(escaped).not.toContain('"')
    expect(escaped).not.toContain('{')
    expect(escaped).not.toContain('}')
    expect(escaped).not.toContain('<')
    expect(escaped).not.toContain('>')
  })

  it('should escape all JSX-dangerous characters together', () => {
    expect(escapeJsxAttribute('"<>{}')).toBe('&quot;&lt;&gt;&#123;&#125;')
  })
})
