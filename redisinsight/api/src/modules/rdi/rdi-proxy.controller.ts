import {
  All,
  Controller,
  Param,
  Req,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { RdiProxyService } from 'src/modules/rdi/rdi-proxy.service';

/**
 * Generic proxy controller that forwards all requests to RDI instances.
 *
 * This controller acts as a reverse proxy, forwarding requests from:
 *   /rdi-proxy/:id/api/v1/monitoring/statistics
 * To the actual RDI instance:
 *   https://rdi-instance/api/v1/monitoring/statistics
 *
 * The controller handles:
 * - All HTTP methods (GET, POST, PUT, DELETE, etc.)
 * - Streaming request/response bodies
 * - Query parameters and headers
 * - x-rdi-* header transformation (e.g., x-rdi-authorization → authorization)
 */
@ApiTags('RDI Proxy')
@Controller('rdi-proxy')
export class RdiProxyController {
  constructor(private readonly proxyService: RdiProxyService) {}

  /**
   * Catch everything after /rdi-proxy/:id/
   * Examples:
   *   /rdi-proxy/abc123/api/v1/login
   *   /rdi-proxy/abc123/api/v1/monitoring/statistics
   *   /rdi-proxy/abc123/api/v2/pipelines/default/status
   */
  @All(':id/*')
  async proxy(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    console.log(`[RdiProxyController] Proxying request for id=${id}, path=${req.path}`);
    const ok = await this.proxyService.forward(id, req, res);
    if (!ok) {
      throw new HttpException('RDI instance not found', HttpStatus.NOT_FOUND);
    }
  }
}
