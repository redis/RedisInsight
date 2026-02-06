import { Injectable, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { createProxyServer, ServerOptions } from 'http-proxy';
import { URL } from 'url';
import * as https from 'https';
import { RdiRepository } from 'src/modules/rdi/repository/rdi.repository';

/**
 * Header prefix for RDI-specific headers.
 * Headers like `x-rdi-authorization` will be transformed to `authorization`.
 */
const RDI_HEADER_PREFIX = 'x-rdi-';

/**
 * Simple proxy service that forwards requests to RDI instances.
 *
 * This service:
 * 1. Resolves RDI instance URL from database by ID
 * 2. Transforms x-rdi-* headers to their standard equivalents
 * 3. Forwards the request as-is using http-proxy (streaming)
 *
 * Authentication is handled by the frontend SDK - it adds x-rdi-authorization
 * header which this proxy transforms to Authorization before forwarding.
 */
@Injectable()
export class RdiProxyService {
  private readonly logger = new Logger(RdiProxyService.name);

  private readonly proxy = createProxyServer({
    changeOrigin: true,
    xfwd: true,
    // Allow self-signed certificates (common in RDI deployments)
    secure: false,
    agent: new https.Agent({
      rejectUnauthorized: false,
    }),
  } as ServerOptions);

  constructor(private readonly repository: RdiRepository) {
    // Handle proxy errors
    this.proxy.on('error', (err, req, res) => {
      console.error(`[RdiProxyService] Proxy error:`, {
        message: err?.message,
        code: (err as any)?.code,
        stack: err?.stack,
      });
      this.logger.error(`Proxy error: ${err?.message ?? err}`);
      const r = res as Response;
      if (!r.headersSent) {
        r.status(502).json({
          statusCode: 502,
          message: `Proxy error: ${err?.message ?? 'Unknown error'}`,
          error: 'Bad Gateway',
        });
      }
    });

    // Log when proxy receives response from target
    this.proxy.on('proxyRes', (proxyRes, req) => {
      console.log(`[RdiProxyService] Response from RDI:`, {
        status: proxyRes.statusCode,
        url: req.url,
      });
    });

    // Log when proxy request is sent
    this.proxy.on('proxyReq', (proxyReq, req) => {
      console.log(`[RdiProxyService] Request sent to RDI:`, {
        method: proxyReq.method,
        path: proxyReq.path,
        host: proxyReq.getHeader('host'),
        contentLength: req.headers['content-length'],
        contentType: req.headers['content-type'],
        bodyRead: !!(req as any).body,
        readable: req.readable,
      });

      // If body was NOT parsed (readable stream), we need to pipe it
      // But http-proxy should handle this automatically
      // If body WAS parsed somehow, we need to re-write it
      if ((req as any).body && Object.keys((req as any).body).length > 0) {
        console.log(`[RdiProxyService] WARNING: Body was already parsed, re-writing...`);
        const bodyData = JSON.stringify((req as any).body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
        proxyReq.end();
      }
    });
  }

  /**
   * Transform x-rdi-* headers to their standard equivalents.
   * Example: x-rdi-authorization → authorization
   *
   * @param headers - Original request headers
   * @returns Headers object with only transformed x-rdi-* headers
   */
  private transformRdiHeaders(
    headers: Record<string, string | string[] | undefined>,
  ): Record<string, string> {
    const transformed: Record<string, string> = {};

    for (const [key, value] of Object.entries(headers)) {
      const lowerKey = key.toLowerCase();

      if (lowerKey.startsWith(RDI_HEADER_PREFIX) && value !== undefined) {
        // Transform x-rdi-foo → foo
        const newKey = lowerKey.slice(RDI_HEADER_PREFIX.length);
        // Convert array to comma-separated string if needed
        transformed[newKey] = Array.isArray(value) ? value.join(', ') : value;
        this.logger.debug(`Header transform: ${key} → ${newKey}`);
      }
    }

    return transformed;
  }

  /**
   * Forward a request to the RDI instance.
   *
   * @param id - RDI instance ID
   * @param req - Express request
   * @param res - Express response
   * @returns true if forwarded successfully, false if instance not found
   */
  async forward(id: string, req: Request, res: Response): Promise<boolean> {
    // 1) Resolve RDI instance from database
    const rdi = await this.repository.get(id);
    if (!rdi) {
      this.logger.warn(`RDI instance not found: ${id}`);
      return false;
    }

    console.log(`[RdiProxyService] RDI instance found:`, {
      id: rdi.id,
      url: rdi.url,
      name: rdi.name,
    });

    // 2) Compute the remainder path after /api/rdi-proxy/:id
    // req.originalUrl includes query string and global /api prefix
    // Example: /api/rdi-proxy/id-1/api/v1?x=1 → /api/v1?x=1
    const prefix = `/api/rdi-proxy/${encodeURIComponent(id)}`;
    const fullUrl = req.originalUrl;
    const rest = fullUrl.startsWith(prefix) ? fullUrl.slice(prefix.length) : '';

    console.log(`[RdiProxyService] URL parsing:`, {
      fullUrl,
      prefix,
      rest,
      startsWithPrefix: fullUrl.startsWith(prefix),
    });

    // 3) Build target URL
    const targetBase = new URL(rdi.url);
    const finalTarget = `${targetBase.origin}${rest || '/'}`;

    console.log(`[RdiProxyService] Proxying:`, {
      method: req.method,
      from: fullUrl,
      to: finalTarget,
    });

    // 4) Transform x-rdi-* headers
    const rdiHeaders = this.transformRdiHeaders(
      req.headers as Record<string, string | string[] | undefined>,
    );

    // 5) Forward request (streaming)
    // http-proxy uses req.url for the path, so we temporarily set it
    const oldUrl = req.url;
    req.url = rest || '/';

    this.proxy.web(req, res, {
      target: targetBase.origin,
      headers: rdiHeaders,
    });

    // Restore original URL
    req.url = oldUrl;

    return true;
  }
}
