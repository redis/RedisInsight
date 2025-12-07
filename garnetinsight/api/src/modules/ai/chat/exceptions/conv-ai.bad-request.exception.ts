import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class ConvAiBadRequestException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.BAD_REQUEST,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'ConvAiBadRequest',
      errorCode: CustomErrorCodes.ConvAiBadRequest,
    };

    super(response, response.statusCode, options);
  }
}
