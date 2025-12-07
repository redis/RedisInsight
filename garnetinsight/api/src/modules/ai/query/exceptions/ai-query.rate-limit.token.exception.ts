import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class AiQueryRateLimitTokenException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.AI_QUERY_TOKEN_RATE_LIMIT,
    options?: HttpExceptionOptions & { details?: unknown },
  ) {
    const response = {
      message,
      statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
      error: 'AiQueryRateLimitToken',
      errorCode: CustomErrorCodes.QueryAiRateLimitToken,
      details: options?.details,
    };

    super(response, response.statusCode, options);
  }
}
