import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export class RdiPipelineInternalServerErrorException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    options?: HttpExceptionOptions,
  ) {
    const hasDetail =
      message && message !== ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
    const response = {
      message,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: CustomErrorCodes.RdiInternalServerError,
      error: 'RdiInternalServerError',
      ...(hasDetail ? { resource: { detail: message } } : {}),
    };

    super(response, HttpStatus.INTERNAL_SERVER_ERROR, options);
  }
}
