import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export class CloudDatabaseEndpointInvalidException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.CLOUD_DATABASE_ENDPOINT_INVALID,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'CloudDatabaseEndpointInvalid',
      errorCode: CustomErrorCodes.CloudDatabaseEndpointInvalid,
    };

    super(response, response.statusCode, options);
  }
}
