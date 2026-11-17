/**
 * Shapes for the RDI native-API passthrough used by the @rdi-ui/pipeline
 * pipeline management UI.
 *
 * That UI ships its own generated SDK which speaks the native RDI API, so
 * RedisInsight forwards those calls instead of mapping them onto its curated
 * `/rdi/:id/pipeline` endpoints. Credentials and self-signed-certificate
 * handling stay server-side, and CORS never comes up because the browser only
 * ever talks to RedisInsight.
 *
 * This is a narrow passthrough for one known client, not a general-purpose
 * proxy: headers are allowlisted in both directions and upstream redirects are
 * refused rather than followed or rewritten.
 */
export interface RdiProxyRequest {
  method: string;

  /**
   * Path relative to the RDI instance base URL, still percent-encoded and
   * without a leading slash.
   */
  path: string;

  /** Raw query string from the incoming request, without the leading '?'. */
  query?: string;

  /**
   * Parsed JSON body, or undefined when the request has no body.
   *
   * The RDI API is JSON on every endpoint, so the globally installed JSON body
   * parser already covers it - which also means `maxPayloadSize` and its 413
   * handling apply here exactly as they do to any other RedisInsight route.
   * RdiProxyController refuses any other content type rather than forwarding a
   * body the parser silently dropped.
   */
  body?: unknown;

  /** Headers to forward upstream. Allowlisted by RdiProxyService. */
  headers: Record<string, string>;
}

export interface RdiProxyResponse {
  status: number;

  headers: Record<string, string>;

  /**
   * Raw response bytes, forwarded to the browser untouched.
   *
   * Deliberately not parsed: letting axios decode and the controller
   * re-serialize turns a top-level JSON `null` into an empty body and strips
   * the quotes off a bare JSON string.
   */
  body: Buffer;
}
