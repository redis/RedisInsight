import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class CloudApiForbiddenException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.FORBIDDEN,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.FORBIDDEN,
      error: 'CloudApiForbidden',
      errorCode: CustomErrorCodes.CloudApiForbidden,
    };

    super(response, response.statusCode, options);
  }
}
