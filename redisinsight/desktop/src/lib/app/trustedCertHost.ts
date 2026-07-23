// Hostnames served by the bundled backend, which may present a self-signed
// certificate. Only these are trusted when a TLS certificate error occurs;
// certificate errors from any remote host (e.g. the Copilot service) must be
// rejected so a network attacker cannot intercept the connection.
const LOOPBACK_HOSTNAMES = ['localhost', '127.0.0.1', '[::1]', '::1']

export const isTrustedCertHost = (url: unknown): boolean => {
  if (typeof url !== 'string') {
    return false
  }
  try {
    return LOOPBACK_HOSTNAMES.includes(new URL(url).hostname)
  } catch {
    return false
  }
}
