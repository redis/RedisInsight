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
const OUT_OF_SCOPE_MESSAGE =
  'Requested path is outside the configured RDI instance URL';

/**
 * Percent-encoded separators that an upstream might decode.
 *
 * Backslash is included because Windows-hosted and some proxy implementations
 * treat it as a path separator once decoded.
 */
const ENCODED_SEPARATORS = /%2f|%5c/gi;

/**
 * The given pathname as an upstream would read it if it percent-decoded
 * separators *before* normalizing dot segments.
 */
const readWithDecodedSeparators = (pathname: string, origin: string): string =>
  new URL(pathname.replace(ENCODED_SEPARATORS, '/'), origin).pathname;

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
    throw new ForbiddenException(OUT_OF_SCOPE_MESSAGE);
  }

  // `new URL()` correctly treats %2F as an opaque character rather than a
  // separator, so the check above reads `..%2fadmin` as a single segment and
  // lets it through. An upstream - or a reverse proxy in front of RDI - that
  // decodes first and normalizes second reads the same path as `../admin` and
  // lands outside the base. Check that reading too, so containment holds
  // whichever order the upstream happens to use. An encoded slash inside a
  // real segment still passes, since it resolves within the base either way.
  if (
    !readWithDecodedSeparators(url.pathname, base.origin).startsWith(
      readWithDecodedSeparators(base.pathname, base.origin),
    )
  ) {
    throw new ForbiddenException(OUT_OF_SCOPE_MESSAGE);
  }

  url.search = query ?? '';

  return url;
};
