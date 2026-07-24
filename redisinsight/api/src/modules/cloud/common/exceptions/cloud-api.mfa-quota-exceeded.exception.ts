import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class CloudApiMfaQuotaExceededException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.CLOUD_MFA_QUOTA_EXCEEDED,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      error: 'CloudApiMfaQuotaExceeded',
      errorCode: CustomErrorCodes.CloudApiMfaQuotaExceeded,
    };

    super(response, response.statusCode, options);
  }
}
