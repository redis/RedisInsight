import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class CloudOauthMisconfigurationException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.CLOUD_OAUTH_MISCONFIGURATION,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'CloudOauthMisconfiguration',
      errorCode: CustomErrorCodes.CloudOauthMisconfiguration,
    };

    super(response, response.statusCode, options);
  }
}
