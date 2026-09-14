/**
 * Shapes for the RDI native-API passthrough used by the @rdi-ui/pipeline
 * pipeline management UI.
 *
 * The UI ships its own SDK that talks the native RDI API, so RedisInsight
 * forwards those calls verbatim rather than mapping them onto its curated
 * /rdi/:id/pipeline endpoints. Auth and TLS handling stay server-side.
 */
export interface RdiProxyRequest {
  method: string;

  /** Path relative to the RDI instance base URL, without a leading slash. */
  path: string;

  /** Raw query string from the incoming request, without the leading '?'. */
  query?: string;

  body?: unknown;

  /**
   * Headers forwarded from the caller. Hop-by-hop, auth and host headers are
   * stripped before they reach here.
   */
  headers?: Record<string, string>;
}

export interface RdiProxyResponse {
  status: number;

  headers: Record<string, string>;

  data: unknown;
}
