import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { RdiClientProvider } from 'src/modules/rdi/providers/rdi.client.provider';
import { ApiRdiClient } from 'src/modules/rdi/client/api/v1/api.rdi.client';
import {
  RdiClientMetadata,
  RdiProxyRequest,
  RdiProxyResponse,
} from 'src/modules/rdi/models';

/**
 * Request headers forwarded upstream.
 *
 * Allowlisted rather than denylisted on purpose. A denylist has to be extended
 * every time RedisInsight introduces a header of its own - `x-csrf-token` in
 * hosted builds and `x-window-id` in Electron both authorize access to
 * RedisInsight's own backend - and forgetting one hands it to whatever host the
 * RDI instance happens to point at. `authorization` is absent for the same
 * reason it would be stripped: the RdiClient attaches its own bearer token.
 *
 * `content-length` and `content-encoding` are absent because the body is
 * re-serialized from the parsed JSON before it goes upstream: the caller's
 * length no longer matches and the caller's encoding has already been undone,
 * so axios has to recompute both.
 */
const FORWARDED_REQUEST_HEADERS = ['content-type', 'accept'];

/**
 * Response headers forwarded back to the browser.
 *
 * Also an allowlist, and for a stronger reason: a proxied response is served
 * from RedisInsight's own origin, so any origin-scoped header the RDI instance
 * sets would apply to RedisInsight itself. `strict-transport-security`,
 * `clear-site-data`, `content-security-policy`, `content-security-policy-report-only`,
 * `report-to`, `nel`, `set-cookie` and `access-control-*` are not RDI's
 * decision to make, and a denylist would have to keep growing to cover them.
 */
const FORWARDED_RESPONSE_HEADERS = ['content-type'];

/**
 * Applied to every proxied response.
 *
 * If a compromised RDI instance returned `text/html`, opening a proxy URL as a
 * document would otherwise render it under RedisInsight's origin. `sandbox`
 * blocks that without affecting the fetch/XHR responses the pipeline SDK
 * actually consumes.
 */
const FORCED_RESPONSE_HEADERS: Record<string, string> = {
  'content-security-policy': 'sandbox',
  'x-content-type-options': 'nosniff',
};

/**
 * Listed explicitly rather than testing the whole 3xx range: 304 and 300 are
 * not redirects and carry no Location, so there is nothing to refuse about
 * them.
 */
const REDIRECT_STATUSES = [301, 302, 303, 307, 308];

const pickHeaders = (
  headers: Record<string, string> = {},
  allowed: string[],
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(headers).filter(([name]) =>
      allowed.includes(name.toLowerCase()),
    ),
  );

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

    // Type narrowing rather than a real branch: every client the factory can
    // build is an ApiRdiClient, since the v2 client extends it.
    if (!(client instanceof ApiRdiClient)) {
      throw new BadRequestException(
        'This RDI instance does not support native API requests',
      );
    }

    const response = await client.proxyRequest({
      ...request,
      headers: pickHeaders(request.headers, FORWARDED_REQUEST_HEADERS),
    });

    client.setLastUsed();

    // The RDI API itself never redirects, so a redirect means something else
    // answered - a reverse proxy, an auth gateway, a captive portal. Handing
    // the raw Location to the browser would send it straight at the RDI host,
    // bypassing the auth this proxy injects; rewriting it to point back here
    // is a lot of URL surgery for traffic that does not exist. Fail loudly
    // instead. (Any other 3xx that slips through is harmless: `location` is
    // not in the response allowlist, so it never reaches the browser.)
    if (REDIRECT_STATUSES.includes(response.status)) {
      throw new BadGatewayException(
        'RDI instance returned an unexpected redirect',
      );
    }

    return {
      ...response,
      headers: {
        ...pickHeaders(response.headers, FORWARDED_RESPONSE_HEADERS),
        ...FORCED_RESPONSE_HEADERS,
      },
    };
  }
}
