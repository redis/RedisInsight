import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class AiQueryRateLimitRequestException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.AI_QUERY_REQUEST_RATE_LIMIT,
    options?: HttpExceptionOptions & { details?: unknown },
  ) {
    const response = {
      message,
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      error: 'AiQueryRateLimitRequest',
      errorCode: CustomErrorCodes.QueryAiRateLimitRequest,
      details: options?.details,
    };

    super(response, response.statusCode, options);
  }
}
