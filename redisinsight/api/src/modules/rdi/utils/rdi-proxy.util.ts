import { ForbiddenException } from '@nestjs/common';

/**
 * Helpers for the RDI native-API passthrough (see RdiProxyController).
 *
 * Specific to that endpoint, not general-purpose proxy helpers: both URL
 * readers assume RedisInsight's own `rdi/:id/proxy` mount point, and the
 * resolver enforces containment within a single RDI instance's configured URL.
 *
 * Kept as pure functions so the URL handling - the security-sensitive part of
 * the proxy - can be tested directly on strings rather than through an HTTP
 * request or a mocked axios instance.
 */

/**
 * Extracts the upstream path from a proxy request URL.
 *
 * Read from the raw, still percent-encoded URL rather than Express's decoded
 * `req.params.path` wildcard: decoding first would turn an encoded delimiter
 * (`%2F`, `%3F`, `%23`) into a literal separator and change which upstream URL
 * gets requested.
 *
 * `requestUrl` still carries RedisInsight's own prefixes (`RI_PROXY_PATH` and
 * the global prefix), which is why the mount point is located by searching for
 * the `rdi/:id/proxy` marker instead of being assumed to sit at the start.
 */
export const getRdiUpstreamPath = (
  requestUrl: string,
  rdiInstanceId: string,
): string => {
  const [rawPath] = requestUrl.split('?');
  const marker = `/rdi/${encodeURIComponent(rdiInstanceId)}/proxy`;
  const markerIndex = rawPath.indexOf(marker);

  if (markerIndex === -1) {
    return '';
  }

  return rawPath.slice(markerIndex + marker.length).replace(/^\/+/, '');
};

/**
 * Raw query string of a proxy request URL, without the leading '?'.
 *
 * Everything after the first '?' is kept verbatim, so a query that itself
 * contains a '?' survives intact.
 */
export const getRdiUpstreamQuery = (requestUrl: string): string =>
  requestUrl.split('?').slice(1).join('?');

/**
 * Resolves a caller-supplied path against the RDI instance's base URL into the
 * absolute URL to request.
 *
 * Resolution happens once, here, so the URL that gets validated is
 * byte-for-byte the URL that gets sent. Validating a decoded copy while sending
 * an encoded one is what makes hand-rolled proxies leak: `new URL()` normalizes
 * `.` and `..` segments (encoded or not) and leaves every other escape
 * untouched, so the containment check sees the final path.
 *
 * `rdiUrl` may legitimately carry a path of its own - RDI behind a reverse proxy
 * under a subpath - so containment is checked against that prefix and not just
 * the origin. An absolute or scheme-relative `path` fails the same check, which
 * is what keeps this from being an SSRF primitive.
 */
export const resolveRdiUpstreamUrl = (
  rdiUrl: string,
  path: string,
  query?: string,
): URL => {
  // the trailing slash matters: without it WHATWG resolution drops the base's
  // last segment as though it were a filename
  const base = new URL(rdiUrl.replace(/\/*$/, '/'));

  let url: URL;

  try {
    url = new URL(path.replace(/^\/+/, ''), base);
  } catch {
    throw new ForbiddenException('Requested path is malformed');
  }

  if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) {
    throw new ForbiddenException(
      'Requested path is outside the configured RDI instance URL',
    );
  }

  url.search = query ?? '';

  return url;
};
