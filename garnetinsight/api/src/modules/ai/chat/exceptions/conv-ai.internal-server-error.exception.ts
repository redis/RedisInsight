import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class ConvAiInternalServerErrorException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'ConvAiInternalServerError',
      errorCode: CustomErrorCodes.ConvAiInternalServerError,
    };

    super(response, response.statusCode, options);
  }
}
