import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class RdiPipelineBadRequestException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.BAD_REQUEST,
    options?: HttpExceptionOptions & { details?: unknown },
  ) {
    const response = {
      message,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'RdiBadRequest',
      errorCode: CustomErrorCodes.RdiBadRequest,
      detail: options?.details,
    };

    super(response, response.statusCode, options);
  }
}
