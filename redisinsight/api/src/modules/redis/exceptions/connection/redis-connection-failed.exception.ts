import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { isString } from 'lodash';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

// The HTTP 424 Failed Dependency client error response status code indicates
// that the method could not be performed on the resource because the requested action
// depended on another action, and that action failed.
export const RedisConnectionFailedStatusCode = HttpStatus.FAILED_DEPENDENCY;

export class RedisConnectionFailedException extends HttpException {
  constructor(
    message:
      | string
      | Record<string, any> = ERROR_MESSAGES.REDIS_CONNECTION_FAILED,
    options?: HttpExceptionOptions,
  ) {
    let response: Record<string, any>;

    if (isString(message)) {
      response = {
        message,
        error: 'RedisConnectionFailedException',
        statusCode: RedisConnectionFailedStatusCode,
        errorCode: CustomErrorCodes.RedisConnectionFailed,
      };
    } else {
      response = message;
    }

    super(response, RedisConnectionFailedStatusCode, options);
  }
}
