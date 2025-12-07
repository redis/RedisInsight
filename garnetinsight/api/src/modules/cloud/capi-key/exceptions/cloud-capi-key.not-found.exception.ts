import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class CloudCapiKeyNotFoundException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.NOT_FOUND,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.NOT_FOUND,
      error: 'CloudCapiKeyNotFound',
      errorCode: CustomErrorCodes.CloudCapiKeyNotFound,
    };

    super(response, response.statusCode, options);
  }
}
