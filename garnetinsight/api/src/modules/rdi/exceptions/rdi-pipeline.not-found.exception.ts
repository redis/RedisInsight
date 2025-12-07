import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class RdiPipelineNotFoundException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.BAD_REQUEST,
    options?: HttpExceptionOptions & { details?: unknown },
  ) {
    const response = {
      message,
      statusCode: HttpStatus.NOT_FOUND,
      error: 'RdiNotFound',
      errorCode: CustomErrorCodes.RdiNotFound,
      details: options?.details,
    };
    super(response, response.statusCode, options);
  }
}
