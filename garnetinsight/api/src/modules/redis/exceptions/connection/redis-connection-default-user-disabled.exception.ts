import { HttpExceptionOptions } from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  RedisConnectionFailedException,
  RedisConnectionFailedStatusCode,
} from 'src/modules/redis/exceptions/connection/redis-connection-failed.exception';

export class RedisConnectionDefaultUserDisabledException extends RedisConnectionFailedException {
  constructor(
    message: string = ERROR_MESSAGES.DATABASE_DEFAULT_USER_DISABLED,
    options?: HttpExceptionOptions,
  ) {
    super(
      {
        message,
        error: 'RedisConnectionDefaultUserDisabledException',
        statusCode: RedisConnectionFailedStatusCode,
        errorCode: CustomErrorCodes.RedisConnectionDefaultUserDisabled,
      },
      options,
    );
  }
}
