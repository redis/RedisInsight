import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class CloudApiUnauthorizedException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.UNAUTHORIZED,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.UNAUTHORIZED,
      error: 'CloudApiUnauthorized',
      errorCode: CustomErrorCodes.CloudApiUnauthorized,
    };

    super(response, response.statusCode, options);
  }
}
