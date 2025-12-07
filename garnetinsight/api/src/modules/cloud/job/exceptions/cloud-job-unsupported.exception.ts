import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export class CloudJobUnsupportedException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.CLOUD_JOB_UNSUPPORTED,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.NOT_IMPLEMENTED,
      error: 'CloudJobUnsupported',
      errorCode: CustomErrorCodes.CloudJobUnsupported,
    };

    super(response, response.statusCode, options);
  }
}
