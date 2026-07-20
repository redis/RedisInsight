import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export class CloudJobUnexpectedErrorException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.CLOUD_JOB_UNEXPECTED_ERROR,
    options?: HttpExceptionOptions,
  ) {
    const hasDetail =
      message && message !== ERROR_MESSAGES.CLOUD_JOB_UNEXPECTED_ERROR;
    const response = {
      message,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'CloudJobUnexpectedError',
      errorCode: CustomErrorCodes.CloudJobUnexpectedError,
      ...(hasDetail ? { resource: { detail: message } } : {}),
      // cause: options?.cause, // todo: check
    };

    super(response, response.statusCode, options);
  }
}
