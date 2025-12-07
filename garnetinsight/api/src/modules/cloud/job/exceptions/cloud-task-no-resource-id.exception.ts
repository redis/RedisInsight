import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export class CloudTaskNoResourceIdException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.CLOUD_TASK_NO_RESOURCE_ID,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'CloudTaskNoResourceId',
      errorCode: CustomErrorCodes.CloudTaskNoResourceId,
    };

    super(response, response.statusCode, options);
  }
}
