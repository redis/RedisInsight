import { HttpExceptionOptions } from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  RedisConnectionFailedException,
  RedisConnectionFailedStatusCode,
} from 'src/modules/redis/exceptions/connection/redis-connection-failed.exception';

export class RedisConnectionAuthUnsupportedException extends RedisConnectionFailedException {
  constructor(
    message: string = ERROR_MESSAGES.COMMAND_NOT_SUPPORTED('auth'),
    options?: HttpExceptionOptions,
  ) {
    super(
      {
        message,
        error: 'RedisConnectionAuthUnsupportedException',
        statusCode: RedisConnectionFailedStatusCode,
        errorCode: CustomErrorCodes.RedisConnectionAuthUnsupported,
      },
      options,
    );
  }
}
