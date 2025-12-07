import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class CloudOauthSsoUnsupportedEmailException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.CLOUD_OAUTH_SSO_UNSUPPORTED_EMAIL,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'CloudOauthSsoUnsupportedEmail',
      errorCode: CustomErrorCodes.CloudOauthSsoUnsupportedEmail,
    };

    super(response, response.statusCode, options);
  }
}
