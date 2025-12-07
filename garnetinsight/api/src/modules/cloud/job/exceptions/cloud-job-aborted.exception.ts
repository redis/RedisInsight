import { HttpException, HttpExceptionOptions } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export class CloudJobAbortedException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.CLOUD_JOB_ABORTED,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: 499,
      error: 'CloudJobAborted',
      errorCode: CustomErrorCodes.CloudJobAborted,
    };

    super(response, response.statusCode, options);
  }
}
