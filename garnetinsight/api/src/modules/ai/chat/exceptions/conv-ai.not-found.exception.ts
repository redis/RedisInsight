import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class ConvAiNotFoundException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.NOT_FOUND,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.NOT_FOUND,
      error: 'ConvAiNotFound',
      errorCode: CustomErrorCodes.ConvAiNotFound,
    };

    super(response, response.statusCode, options);
  }
}
