import { Injectable, Logger } from '@nestjs/common';
import { RdiClientProvider } from 'src/modules/rdi/providers/rdi.client.provider';
import {
  RdiClientMetadata,
  RdiProxyRequest,
  RdiProxyResponse,
} from 'src/modules/rdi/models';

/**
 * Headers that must not be forwarded to the RDI instance.
 *
 * `authorization` is dropped because the proxy attaches the RDI client's own
 * bearer token; `host`/`content-length` are recalculated by axios; the rest are
 * hop-by-hop headers that are meaningless to the upstream.
 */
const STRIPPED_REQUEST_HEADERS = new Set([
  'host',
  'connection',
  'keep-alive',
  'content-length',
  'content-encoding',
  'transfer-encoding',
  'upgrade',
  'proxy-authorization',
  'proxy-authenticate',
  'te',
  'trailer',
  'authorization',
  'cookie',
  'x-csrf-token',
  'x-window-id',
]);

/**
 * Response headers that describe the upstream transport rather than the payload
 * and would corrupt the response if replayed to the browser.
 *
 * `access-control-*` is dropped too: Nest's own enableCors() already sets the
 * correct policy for RedisInsight's own origin, and RDI's CORS headers (which
 * describe a policy for RDI's own origin, not RedisInsight's) would replace it.
 */
const STRIPPED_RESPONSE_HEADERS = new Set([
  'connection',
  'keep-alive',
  'content-length',
  'content-encoding',
  'transfer-encoding',
  'upgrade',
  'set-cookie',
  // browsers act on this even for a plain fetch response - would let RDI
  // wipe RedisInsight's own cookies/storage since it comes from our origin
  'clear-site-data',
  // overridden below with FORCED_RESPONSE_HEADERS, not just stripped
  'content-security-policy',
  'x-content-type-options',
]);
const STRIPPED_RESPONSE_HEADER_PREFIXES = ['access-control-'];

/**
 * If RDI is compromised and returns e.g. `text/html`, opening the proxy URL
 * as a document would otherwise render/execute that response under
 * RedisInsight's own origin. `sandbox` only affects that document-navigation
 * case - it doesn't touch the fetch/XHR responses the pipeline SDK actually
 * consumes.
 */
const FORCED_RESPONSE_HEADERS: Record<string, string> = {
  'content-security-policy': 'sandbox',
  'x-content-type-options': 'nosniff',
};

@Injectable()
export class RdiProxyService {
  private readonly logger = new Logger('RdiProxyService');

  constructor(private readonly rdiClientProvider: RdiClientProvider) {}

  async proxy(
    rdiClientMetadata: RdiClientMetadata,
    request: RdiProxyRequest,
  ): Promise<RdiProxyResponse> {
    this.logger.debug('Proxying request to rdi instance', rdiClientMetadata);

    const client = await this.rdiClientProvider.getOrCreate(rdiClientMetadata);

    const response = await client.proxyRequest({
      ...request,
      headers: RdiProxyService.filterRequestHeaders(request.headers),
    });

    client.setLastUsed();

    return {
      ...response,
      headers: RdiProxyService.filterResponseHeaders(response.headers),
    };
  }

  private static filterRequestHeaders(
    headers: Record<string, string> = {},
  ): Record<string, string> {
    return Object.fromEntries(
      Object.entries(headers).filter(
        ([name]) => !STRIPPED_REQUEST_HEADERS.has(name.toLowerCase()),
      ),
    );
  }

  private static filterResponseHeaders(
    headers: Record<string, string> = {},
  ): Record<string, string> {
    const filtered = Object.fromEntries(
      Object.entries(headers).filter(([name]) => {
        const lowerName = name.toLowerCase();
        return (
          !STRIPPED_RESPONSE_HEADERS.has(lowerName) &&
          !STRIPPED_RESPONSE_HEADER_PREFIXES.some((prefix) =>
            lowerName.startsWith(prefix),
          )
        );
      }),
    );

    return { ...filtered, ...FORCED_RESPONSE_HEADERS };
  }
}
