// Allowlist of URL schemes safe to render in href/src. Anything else
// (javascript:, data:, vbscript:) is dropped so it cannot execute or smuggle
// markup. Relative and anchor URLs have no scheme and are allowed. Protocol-relative
// URLs (//host/path) are blocked to prevent open redirects.
const ALLOWED_PROTOCOLS = ['http:', 'https:', 'mailto:']

export const safeUrl = (url: string): string => {
  try {
    const parsed = new URL(url, 'relative:///')
    if (parsed.protocol === 'relative:') {
      // Block protocol-relative URLs (//host/path) which can open-redirect
      if (parsed.host) {
        return ''
      }
      return url
    }
    return ALLOWED_PROTOCOLS.includes(parsed.protocol) ? url : ''
  } catch {
    return ''
  }
}
