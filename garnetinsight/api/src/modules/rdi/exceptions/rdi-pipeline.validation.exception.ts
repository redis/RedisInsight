import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class RdiPipelineValidationException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.RDI_VALIDATION_ERROR,
    options?: HttpExceptionOptions & { details?: unknown },
  ) {
    const response = {
      message,
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      error: 'RdiValidationError',
      errorCode: CustomErrorCodes.RdiValidationError,
      details: options,
    };

    super(response, response.statusCode, options);
  }
}
