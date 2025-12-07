import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export class CloudDatabaseImportForbiddenException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.CLOUD_DATABASE_IMPORT_FORBIDDEN,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.FORBIDDEN,
      error: 'CloudDatabaseImportForbidden',
      errorCode: CustomErrorCodes.CloudDatabaseImportForbidden,
    };

    super(response, response.statusCode, options);
  }
}
