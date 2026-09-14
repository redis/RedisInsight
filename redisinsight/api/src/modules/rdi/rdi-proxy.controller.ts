import {
  All,
  Controller,
  MethodNotAllowedException,
  Req,
  Res,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { RdiProxyService } from 'src/modules/rdi/rdi-proxy.service';
import { RequestRdiClientMetadata } from 'src/modules/rdi/decorators';
import { RdiClientMetadata } from 'src/modules/rdi/models';
import {
  getRdiUpstreamPath,
  getRdiUpstreamQuery,
} from 'src/modules/rdi/utils/rdi-proxy.util';

const PROXIED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Matches `application/json` and its suffixed variants (`+json`), with or
 * without parameters such as `; charset=utf-8`.
 */
const JSON_CONTENT_TYPE = /^application\/([\w.+-]+\+)?json\b/i;

/**
 * Passthrough to an RDI instance's native API for the @rdi-ui/pipeline UI.
 *
 * Excluded from Swagger: the surface here is whatever the upstream RDI exposes,
 * not a contract RedisInsight defines.
 *
 * The `*path` wildcard requires at least one segment after `proxy`, so the bare
 * `rdi/:id/proxy` is a 404. That is fine - every RDI endpoint lives under
 * `api/v1` or `api/v2`, and RDI's own root only redirects to its Swagger docs.
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
    if (!PROXIED_METHODS.includes(req.method)) {
      throw new MethodNotAllowedException(
        `Method ${req.method} is not supported by this proxy`,
      );
    }

    const contentType = req.headers['content-type'];

    // Only JSON (and urlencoded) bodies are parsed globally, so anything else
    // would reach us as an undefined body and get forwarded as an empty
    // request while still carrying the caller's content type. Every RDI API
    // endpoint takes JSON, so refuse loudly rather than forward a lie.
    if (contentType && !JSON_CONTENT_TYPE.test(contentType)) {
      throw new UnsupportedMediaTypeException(
        `Content type ${contentType} is not supported by this proxy`,
      );
    }

    const {
      status,
      headers,
      body: responseBody,
    } = await this.rdiProxyService.proxy(rdiClientMetadata, {
      method: req.method,
      path: getRdiUpstreamPath(req.url, rdiClientMetadata.id),
      query: getRdiUpstreamQuery(req.url),
      body: req.body,
      headers: req.headers as Record<string, string>,
    });

    res.status(status).set(headers).send(responseBody);
  }
}
