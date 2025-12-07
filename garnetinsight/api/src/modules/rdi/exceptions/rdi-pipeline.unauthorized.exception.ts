import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class RdiPipelineUnauthorizedException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.UNAUTHORIZED,
    options?: HttpExceptionOptions & { details?: unknown },
  ) {
    const response = {
      message,
      statusCode: HttpStatus.UNAUTHORIZED,
      error: 'RdiUnauthorized',
      errorCode: CustomErrorCodes.RdiUnauthorized,
    };

    super(response, response.statusCode, options);
  }
}
