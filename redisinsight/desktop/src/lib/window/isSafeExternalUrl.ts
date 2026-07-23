// Schemes that are safe to hand to the OS from renderer-controlled URLs. Anything
// else (file:, javascript:, data:, custom protocol handlers such as calculator:
// or ms-settings:) can launch local executables or applications and must not be
// opened on behalf of untrusted content.
const ALLOWED_EXTERNAL_PROTOCOLS = ['http:', 'https:', 'mailto:']

export const isSafeExternalUrl = (url: unknown): url is string => {
  if (typeof url !== 'string') {
    return false
  }
  try {
    const { protocol } = new URL(url)
    return ALLOWED_EXTERNAL_PROTOCOLS.includes(protocol)
  } catch {
    return false
  }
}
