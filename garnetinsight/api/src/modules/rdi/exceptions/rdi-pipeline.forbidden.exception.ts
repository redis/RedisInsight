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
    const response = {
      message,
      statusCode: HttpStatus.FORBIDDEN,
      error: 'RdiForbidden',
      errorCode: CustomErrorCodes.RdiForbidden,
    };

    super(response, response.statusCode, options);
  }
}
