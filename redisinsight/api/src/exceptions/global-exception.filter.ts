import { BaseExceptionFilter } from '@nestjs/core';
import { ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/node';

export class GlobalExceptionFilter extends BaseExceptionFilter {
  private staticServerLogger = new Logger('GlobalExceptionFilter');

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    // Capture exception to Sentry (if initialized)
    // Skip HTTP exceptions with 4xx status codes as they are client errors
    const isHttpException = exception instanceof HttpException;
    const statusCode = isHttpException ? exception.getStatus() : 500;
    const shouldReportToSentry = statusCode >= 500;

    if (shouldReportToSentry) {
      Sentry.captureException(exception, {
        extra: {
          url: request.url,
          method: request.method,
          statusCode,
        },
      });
    }

    if (/^\/(?:plugins|static)\//i.test(request.url)) {
      const response = ctx.getResponse<Response>();
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
