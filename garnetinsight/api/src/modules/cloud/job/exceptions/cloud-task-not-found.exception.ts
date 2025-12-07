import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export class CloudTaskNotFoundException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.CLOUD_TASK_NOT_FOUND,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.NOT_FOUND,
      error: 'CloudTaskNotFound',
      errorCode: CustomErrorCodes.CloudTaskNotFound,
    };

    super(response, response.statusCode, options);
  }
}
