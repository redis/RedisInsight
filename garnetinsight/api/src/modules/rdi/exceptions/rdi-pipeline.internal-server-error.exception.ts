import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class RdiPipelineInternalServerErrorException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'RdiInternalServerError',
    };

    super(response, HttpStatus.INTERNAL_SERVER_ERROR, options);
  }
}
