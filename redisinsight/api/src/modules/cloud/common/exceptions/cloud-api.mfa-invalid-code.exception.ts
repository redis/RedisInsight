import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class CloudApiMfaInvalidCodeException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.CLOUD_MFA_INVALID_CODE,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'CloudApiMfaInvalidCode',
      errorCode: CustomErrorCodes.CloudApiMfaInvalidCode,
    };

    super(response, response.statusCode, options);
  }
}
