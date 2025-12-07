import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class DatabaseAlreadyExistsException extends HttpException {
  constructor(
    databaseId: string,
    message = ERROR_MESSAGES.DATABASE_ALREADY_EXISTS,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.CONFLICT,
      error: 'DatabaseAlreadyExists',
      errorCode: CustomErrorCodes.DatabaseAlreadyExists,
      resource: {
        databaseId,
      },
    };

    super(response, response.statusCode, options);
  }
}
