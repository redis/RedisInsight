import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ExcludeRouteMiddleware implements NestMiddleware {
  use(req: Request) {
    throw new NotFoundException(`Cannot ${req.method} ${req.originalUrl}`);
  }
}
