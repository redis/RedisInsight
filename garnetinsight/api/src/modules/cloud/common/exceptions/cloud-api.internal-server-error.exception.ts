import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class CloudApiInternalServerErrorException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'CloudApiInternalServerError',
      errorCode: CustomErrorCodes.CloudApiInternalServerError,
    };

    super(response, response.statusCode, options);
  }
}
