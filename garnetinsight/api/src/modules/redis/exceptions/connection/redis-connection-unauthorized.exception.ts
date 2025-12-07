import { HttpExceptionOptions } from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  RedisConnectionFailedException,
  RedisConnectionFailedStatusCode,
} from 'src/modules/redis/exceptions/connection/redis-connection-failed.exception';

export class RedisConnectionUnauthorizedException extends RedisConnectionFailedException {
  constructor(
    message: string = ERROR_MESSAGES.AUTHENTICATION_FAILED(),
    options?: HttpExceptionOptions,
  ) {
    super(
      {
        message,
        error: 'RedisConnectionUnauthorizedException',
        statusCode: RedisConnectionFailedStatusCode,
        errorCode: CustomErrorCodes.RedisConnectionUnauthorized,
      },
      options,
    );
  }
}
