import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export class CloudDatabaseInUnexpectedStateException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.CLOUD_DATABASE_IN_UNEXPECTED_STATE,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.NOT_IMPLEMENTED,
      error: 'CloudDatabaseInUnexpectedState',
      errorCode: CustomErrorCodes.CloudDatabaseIsInUnexpectedState,
    };

    super(response, response.statusCode, options);
  }
}
