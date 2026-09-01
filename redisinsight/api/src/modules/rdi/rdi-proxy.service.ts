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
  'transfer-encoding',
  'upgrade',
  'proxy-authorization',
  'proxy-authenticate',
  'te',
  'trailer',
  'authorization',
  'cookie',
]);

/**
 * Response headers that describe the upstream transport rather than the payload
 * and would corrupt the response if replayed to the browser.
 */
const STRIPPED_RESPONSE_HEADERS = new Set([
  'connection',
  'keep-alive',
  'content-length',
  'content-encoding',
  'transfer-encoding',
  'upgrade',
  'set-cookie',
]);

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
    return Object.fromEntries(
      Object.entries(headers).filter(
        ([name]) => !STRIPPED_RESPONSE_HEADERS.has(name.toLowerCase()),
      ),
    );
  }
}
