import { HttpException } from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';

// Generic fallback code: 12_000 + HTTP status (404 -> 12_404).
export const GENERIC_ERROR_CODE_BASE = 12_000;

const resolveErrorCode = (status: number, message: unknown): number =>
  Array.isArray(message)
    ? CustomErrorCodes.ValidationError
    : GENERIC_ERROR_CODE_BASE + status;

// Additively stamp an errorCode onto an HttpException's serialized body. Shared
// by GlobalExceptionFilter and paths that serialize exceptions directly (e.g.
// the body-parser middleware).
export const stampErrorCode = (
  exception: HttpException,
): Record<string, unknown> => {
  const status = exception.getStatus();
  const res = exception.getResponse();

  // String responses serialize as { statusCode, message }; rebuild as an object.
  if (typeof res === 'string') {
    return {
      statusCode: status,
      message: res,
      errorCode: resolveErrorCode(status, res),
    };
  }

  const body = res as Record<string, unknown>;
  if (body.errorCode === undefined) {
    body.errorCode = resolveErrorCode(status, body.message);
  }
  return body;
};
