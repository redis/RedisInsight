import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export class CloudSubscriptionUnableToDetermineException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.CLOUD_SUBSCRIPTION_UNABLE_TO_DETERMINE,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.NOT_FOUND,
      error: 'CloudSubscriptionUnableToDetermine',
      errorCode: CustomErrorCodes.CloudSubscriptionUnableToDetermine,
    };

    super(response, response.statusCode, options);
  }
}
