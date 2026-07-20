import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class RdiPipelineForbiddenException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.FORBIDDEN,
    options?: HttpExceptionOptions & { details?: unknown },
  ) {
    const hasDetail = message && message !== ERROR_MESSAGES.FORBIDDEN;
    const response = {
      message,
      statusCode: HttpStatus.FORBIDDEN,
      error: 'RdiForbidden',
      errorCode: CustomErrorCodes.RdiForbidden,
      ...(hasDetail ? { resource: { detail: message } } : {}),
    };

    super(response, response.statusCode, options);
  }
}
