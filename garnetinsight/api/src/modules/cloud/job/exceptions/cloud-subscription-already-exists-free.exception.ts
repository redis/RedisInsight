import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export class CloudSubscriptionAlreadyExistsFreeException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.CLOUD_SUBSCRIPTION_ALREADY_EXISTS_FREE,
    options?: HttpExceptionOptions & { subscriptionId?: number },
  ) {
    const response = {
      message,
      statusCode: HttpStatus.CONFLICT,
      error: 'CloudSubscriptionAlreadyExistsFree',
      errorCode: CustomErrorCodes.CloudSubscriptionAlreadyExistsFree,
      resource: {
        subscriptionId: options?.subscriptionId,
      },
    };

    super(response, response.statusCode, options);
  }
}
