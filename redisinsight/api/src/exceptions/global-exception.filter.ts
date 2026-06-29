import { BaseExceptionFilter } from '@nestjs/core';
import { ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { stampErrorCode } from './error-code.util';

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

    return super.catch(this.withErrorCode(exception), host);
  }

  private withErrorCode(exception: Error): Error {
    if (!(exception instanceof HttpException)) {
      return exception;
    }

    const body = stampErrorCode(exception);

    // String responses can't carry a code; rebuild. Object responses are
    // mutated in place, so the original exception stands.
    if (typeof exception.getResponse() === 'string') {
      return new HttpException(body, exception.getStatus());
    }

    return exception;
  }
}
