import { HttpException, HttpExceptionOptions } from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class CloudOauthCanceledException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.CLOUD_OAUTH_CANCELED,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: 499,
      error: 'CloudOauthCanceled',
      errorCode: CustomErrorCodes.CloudOauthCanceled,
    };

    super(response, response.statusCode, options);
  }
}
