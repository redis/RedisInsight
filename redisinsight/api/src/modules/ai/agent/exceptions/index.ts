import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';

export function wrapAgentError(
  error: any,
  message = 'AI Agent error',
): HttpException {
  if (error instanceof HttpException) {
    return error;
  }

  if (error?.status === 401 || error?.statusCode === 401) {
    return new BadRequestException(
      'AI Agent authentication failed. Check RI_AI_AGENT_API_KEY.',
    );
  }

  return new InternalServerErrorException(error?.message || message);
}
