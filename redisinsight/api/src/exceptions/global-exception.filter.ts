import { BaseExceptionFilter } from '@nestjs/core';
import { ArgumentsHost, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

export class GlobalExceptionFilter extends BaseExceptionFilter {
  private staticServerLogger = new Logger('GlobalExceptionFilter');

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    if (/^\/(?:plugins|static)\//i.test(request.url)) {
      const response = ctx.getResponse<Response>();
      const statusCode = exception['statusCode'] || 500;
      const message = `Error when trying to fetch ${request.url}`;

      this.staticServerLogger.error(message, { ...exception } as any);
      return response.status(statusCode).json({
        statusCode,
        message,
      });
    }

    return super.catch(exception, host);
  }
}
