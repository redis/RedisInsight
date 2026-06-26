import { BaseExceptionFilter } from '@nestjs/core';
import { ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomErrorCodes } from 'src/constants';

// Generic fallback code: 12_000 + HTTP status (404 -> 12_404).
const GENERIC_ERROR_CODE_BASE = 12_000;

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

  // Stamp an errorCode onto any HttpException that lacks one (additive;
  // exceptions with their own code are left untouched).
  private withErrorCode(exception: Error): Error {
    if (!(exception instanceof HttpException)) {
      return exception;
    }

    const status = exception.getStatus();
    const res = exception.getResponse();

    // String responses serialize as { statusCode, message } — rebuild as an
    // object so the errorCode can be attached.
    if (typeof res === 'string') {
      return new HttpException(
        {
          statusCode: status,
          message: res,
          errorCode: GENERIC_ERROR_CODE_BASE + status,
        },
        status,
      );
    }

    if (res !== null && typeof res === 'object') {
      const body = res as Record<string, unknown>;
      if (body.errorCode === undefined) {
        body.errorCode = Array.isArray(body.message)
          ? CustomErrorCodes.ValidationError
          : GENERIC_ERROR_CODE_BASE + status;
      }
    }

    return exception;
  }
}
