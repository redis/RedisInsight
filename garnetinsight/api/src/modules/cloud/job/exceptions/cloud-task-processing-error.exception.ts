import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export class CloudTaskProcessingErrorException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.CLOUD_TASK_PROCESSING_ERROR,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'CloudTaskProcessingError',
      errorCode: CustomErrorCodes.CloudTaskProcessingError,
    };

    super(response, response.statusCode, options);
  }
}
