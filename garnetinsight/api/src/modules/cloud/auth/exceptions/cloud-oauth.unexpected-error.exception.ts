import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class CloudOauthUnexpectedErrorException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.CLOUD_OAUTH_UNEXPECTED_ERROR,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'CloudOauthUnexpectedError',
      errorCode: CustomErrorCodes.CloudOauthUnexpectedError,
    };

    super(response, response.statusCode, options);
  }
}
