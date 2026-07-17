import { AxiosError } from 'axios';
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';

/**
 * Extract a human-readable message from an agent memory server error
 * response. The OSS server returns FastAPI-style bodies
 * ({ detail: string | { message | msg } }); the Cloud service returns
 * problem-details-style bodies ({ title, detail }). A WAF/CDN in front of
 * either may return plain text.
 */
export const parseErrorMessage = (error: AxiosError<any>): string => {
  const data = error.response?.data;
  if (typeof data === 'string') {
    return data;
  }

  const detail = data?.detail ?? data?.title ?? data?.message;
  if (!detail) return error.message;

  if (typeof detail === 'string') return detail;

  return detail.message || detail.msg || error.message;
};

const exceptionForStatus = (
  status: number | undefined,
  message: string,
): HttpException => {
  switch (status) {
    case 400:
      return new BadRequestException(message);
    case 401:
      return new UnauthorizedException(message);
    case 403:
      return new ForbiddenException(message);
    case 404:
      return new NotFoundException(message);
    case 422:
      return new UnprocessableEntityException(message);
    default:
      return new InternalServerErrorException(message);
  }
};

export const wrapAgentMemoryError = (error: AxiosError<any>): HttpException => {
  if (error instanceof HttpException) {
    return error;
  }

  return exceptionForStatus(error.response?.status, parseErrorMessage(error));
};

/**
 * Map SDK-thrown errors (agent-memory-client and @redis-iris/agent-memory)
 * to the same sanitized HTTP exceptions the axios interceptor produces.
 * Both SDKs carry a statusCode on their server-error classes; everything
 * else (connection, timeout, validation) falls through by name.
 */
const parseErrorBody = (body?: string): string | undefined => {
  if (!body) return undefined;
  try {
    const parsed = JSON.parse(body);
    const detail = parsed?.detail ?? parsed?.title ?? parsed?.message;
    if (typeof detail === 'string') return detail;
    return detail?.message || detail?.msg;
  } catch {
    return body.length <= 200 ? body : undefined;
  }
};

export const wrapSdkError = (error: unknown): HttpException => {
  if (error instanceof HttpException) {
    return error;
  }

  const err = error as {
    name?: string;
    message?: string;
    statusCode?: number;
    body?: string;
  };
  // Speakeasy errors serialize the whole HTTP exchange into `message`
  // (including request$/response$ internals) - extract the human text
  // from the raw body instead, like parseErrorMessage does for axios.
  const message =
    parseErrorBody(err?.body) ||
    (err?.body ? 'Agent memory request failed' : err?.message) ||
    'Agent memory request failed';

  if (typeof err?.statusCode === 'number') {
    return exceptionForStatus(err.statusCode, message);
  }

  switch (err?.name) {
    case 'MemoryNotFoundError':
      return new NotFoundException(message);
    case 'MemoryValidationError':
    case 'SDKValidationError':
    case 'ResponseValidationError':
      return new BadRequestException(message);
    default:
      return new InternalServerErrorException(message);
  }
};
