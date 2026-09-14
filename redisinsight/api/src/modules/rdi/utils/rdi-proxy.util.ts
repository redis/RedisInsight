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
 * Characters that determine how a path is structured. A segment decoding to any
 * of these could be re-read as more than one segment further down the chain.
 *
 * `%` is the load-bearing one: encoding a `%` is the only way to nest
 * encodings, so refusing a segment that decodes to one rules out double,
 * triple and arbitrarily-deep encoding with a single condition - instead of
 * needing a new case for every extra layer.
 */
const STRUCTURAL_CHARACTERS = /[/\\?#%]/;

/**
 * Requires every caller-supplied path segment to be inert - to mean the same
 * thing no matter how many times it is decoded.
 *
 * `new URL()` resolves and normalizes dot segments but deliberately leaves
 * percent-escapes alone, so `..%2fadmin` and `%252e%252e%252fadmin` both look
 * like one harmless segment to a containment check. Anything between here and
 * RDI - a reverse proxy, RDI's own router, or both in sequence - may decode
 * before normalizing and arrive somewhere else entirely.
 *
 * Predicting how many layers decode, and in what order, is not a winnable game;
 * there is always one more encoding. So this does not try. It requires each
 * segment to decode cleanly to something with no structural meaning, which
 * makes the path unambiguous for every layer at once.
 *
 * The cost: a pipeline name containing `/` or `%` cannot be addressed through
 * the proxy. Names are identifier-shaped in practice, an encoded separator
 * would not survive RDI's own path routing either, and spaces and non-ASCII
 * characters are unaffected.
 */
const assertPathIsInert = (path: string): void => {
  path.split('/').forEach((segment) => {
    if (!segment) {
      return;
    }

    let decoded: string;

    try {
      decoded = decodeURIComponent(segment);
    } catch {
      // a lone `%`, or an invalid/overlong UTF-8 escape - what a different
      // decoder would make of it is anyone's guess, so do not forward it
      throw new ForbiddenException('Requested path is malformed');
    }

    if (
      STRUCTURAL_CHARACTERS.test(decoded) ||
      decoded === '.' ||
      decoded === '..'
    ) {
      throw new ForbiddenException(OUT_OF_SCOPE_MESSAGE);
    }
  });
};

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

  // Containment above only holds for the path as we send it. Everything after
  // the configured base is caller-supplied, so require it to survive any
  // amount of decoding unchanged - see assertPathIsInert. The base itself is
  // operator-configured and trusted, so it is not subject to this.
  assertPathIsInert(url.pathname.slice(base.pathname.length));

  url.search = query ?? '';

  return url;
};
