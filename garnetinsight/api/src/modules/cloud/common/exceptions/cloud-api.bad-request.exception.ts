import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class CloudApiBadRequestException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.BAD_REQUEST,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'CloudApiBadRequest',
      errorCode: CustomErrorCodes.CloudApiBadRequest,
    };

    super(response, response.statusCode, options);
  }
}
