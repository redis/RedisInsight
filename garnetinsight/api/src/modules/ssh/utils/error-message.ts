/**
 * Sanitizes an error message by removing sensitive data:
 *
 * - IP addresses (with optional ports)
 * - Hostnames
 * - Domains
 * - Private key-related content
 *
 * Examples:
 * - `"getaddrinfo ENOTFOUND domain.com"` → `"getaddrinfo ENOTFOUND"`
 * - `"connect EHOSTDOWN 127.0.0.1:22"` → `"connect EHOSTDOWN"`
 * - `"Cannot parse privateKey ..."` → `"Cannot parse privateKey"`
 *
 * @param {string} message - The raw error message.
 * @returns {string} A sanitized, safe-to-display message.
 */
export const sanitizeMessage = (message: string): string => {
  if (message.includes('Cannot parse privateKey'))
    return 'Cannot parse privateKey';

  const coreError = message.match(/(getaddrinfo|connect|read|write)\s+[A-Z_]+/);
  if (coreError) return coreError[0];

  // Remove known sensitive patterns from the message
  const regexes = [
    /(?:\d{1,3}\.){3}\d{1,3}(?::\d{1,5})?/g, // IP + port
    /\b[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+/g, // Hostname/domain
  ];

  return regexes.reduce(
    (sanitized, regex) => sanitized.replace(regex, '').trim(),
    message,
  );
};
