import {
  All,
  Controller,
  MethodNotAllowedException,
  Req,
  Res,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { RdiProxyService } from 'src/modules/rdi/rdi-proxy.service';
import { RequestRdiClientMetadata } from 'src/modules/rdi/decorators';
import { RdiClientMetadata } from 'src/modules/rdi/models';

const ALLOWED_PROXY_METHODS = new Set([
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
]);

/**
 * Transparent passthrough to an RDI instance's native API.
 *
 * The @rdi-ui/pipeline pipeline management UI ships its own RDI SDK and
 * expects to call the native API directly. Routing it through here keeps the
 * instance credentials and the self-signed-certificate handling server-side,
 * and avoids CORS entirely since the browser only ever talks to RedisInsight.
 *
 * Excluded from Swagger: the surface is whatever the upstream RDI exposes, not
 * a contract RedisInsight defines.
 */
@ApiExcludeController()
@Controller('rdi/:id/proxy')
export class RdiProxyController {
  constructor(private readonly rdiProxyService: RdiProxyService) {}

  @All('*path')
  async proxy(
    @RequestRdiClientMetadata() rdiClientMetadata: RdiClientMetadata,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    if (!ALLOWED_PROXY_METHODS.has(req.method)) {
      throw new MethodNotAllowedException(
        `Method ${req.method} is not supported by this proxy`,
      );
    }

    const { status, headers, data } = await this.rdiProxyService.proxy(
      rdiClientMetadata,
      {
        method: req.method,
        path: RdiProxyController.getUpstreamPath(req, rdiClientMetadata.id),
        query: RdiProxyController.getQueryString(req),
        body: req.body,
        headers: req.headers as Record<string, string>,
      },
    );

    res.status(status).set(headers).send(data);
  }

  /**
   * Sliced from the raw (still percent-encoded) URL rather than Express's
   * decoded `req.params.path` wildcard array - decoding first would turn an
   * encoded delimiter like %2F into a literal path separator axios acts on.
   */
  private static getUpstreamPath(req: Request, rdiInstanceId: string): string {
    const rawPath = req.url.split('?')[0];
    const marker = `/rdi/${rdiInstanceId}/proxy`;
    const markerIndex = rawPath.indexOf(marker);

    if (markerIndex === -1) {
      return '';
    }

    return rawPath.slice(markerIndex + marker.length).replace(/^\/+/, '');
  }

  private static getQueryString(req: Request): string {
    return req.url.split('?').slice(1).join('?');
  }
}
