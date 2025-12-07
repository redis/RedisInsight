import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class AiQueryNotFoundException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.NOT_FOUND,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.NOT_FOUND,
      error: 'AiQueryNotFound',
      errorCode: CustomErrorCodes.QueryAiNotFound,
    };

    super(response, response.statusCode, options);
  }
}
