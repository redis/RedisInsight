import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export class CloudPlanNotFoundFreeException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.CLOUD_PLAN_NOT_FOUND_FREE,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.NOT_FOUND,
      error: 'CloudPlanNotFoundFree',
      errorCode: CustomErrorCodes.CloudPlanUnableToFindFree,
    };

    super(response, response.statusCode, options);
  }
}
