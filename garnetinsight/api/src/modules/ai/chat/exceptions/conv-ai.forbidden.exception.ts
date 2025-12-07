import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class ConvAiForbiddenException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.FORBIDDEN,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.FORBIDDEN,
      error: 'ConvAiForbidden',
      errorCode: CustomErrorCodes.ConvAiForbidden,
    };

    super(response, response.statusCode, options);
  }
}
