import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class CloudOauthMissedRequiredDataException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.CLOUD_OAUTH_MISSED_REQUIRED_DATA,
    options?: HttpExceptionOptions,
  ) {
    const hasDetail =
      message && message !== ERROR_MESSAGES.CLOUD_OAUTH_MISSED_REQUIRED_DATA;
    const response = {
      message,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'CloudOauthMissedRequiredData',
      errorCode: CustomErrorCodes.CloudOauthMissedRequiredData,
      ...(hasDetail ? { resource: { detail: message } } : {}),
    };

    super(response, response.statusCode, options);
  }
}
