const JSX_ATTR_ESCAPE_MAP: Record<string, string> = {
  '"': '&quot;',
  '<': '&lt;',
  '>': '&gt;',
  '{': '&#123;',
  '}': '&#125;',
}

const JSX_ATTR_ESCAPE_RE = /["<>{}]/g

export const escapeJsxAttribute = (value: string): string =>
  value.replace(JSX_ATTR_ESCAPE_RE, (ch) => JSX_ATTR_ESCAPE_MAP[ch])
