import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class AiQueryForbiddenException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.FORBIDDEN,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.FORBIDDEN,
      error: 'AiQueryForbidden',
      errorCode: CustomErrorCodes.QueryAiForbidden,
    };

    super(response, response.statusCode, options);
  }
}
