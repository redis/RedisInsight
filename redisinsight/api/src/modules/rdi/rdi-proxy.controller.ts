import { All, Controller, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { RdiProxyService } from 'src/modules/rdi/rdi-proxy.service';
import { RequestRdiClientMetadata } from 'src/modules/rdi/decorators';
import { RdiClientMetadata } from 'src/modules/rdi/models';

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
    const { status, headers, data } = await this.rdiProxyService.proxy(
      rdiClientMetadata,
      {
        method: req.method,
        path: RdiProxyController.getUpstreamPath(req),
        query: RdiProxyController.getQueryString(req),
        body: req.body,
        headers: req.headers as Record<string, string>,
      },
    );

    res.status(status).set(headers).send(data);
  }

  /**
   * Express 5 requires named wildcards, so `*path` lands in `req.params.path`
   * as an array of segments. Falls back to slicing the raw URL for safety.
   */
  private static getUpstreamPath(req: Request): string {
    const wildcard = (req.params as Record<string, unknown>)?.path;

    if (Array.isArray(wildcard)) {
      return wildcard.join('/');
    }

    if (typeof wildcard === 'string') {
      return wildcard.replace(/^\/+/, '');
    }

    return req.url.split('?')[0].replace(/^\/+/, '');
  }

  private static getQueryString(req: Request): string {
    return req.url.split('?').slice(1).join('?');
  }
}
