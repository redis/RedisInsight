import { HttpExceptionOptions } from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  RedisConnectionFailedException,
  RedisConnectionFailedStatusCode,
} from 'src/modules/redis/exceptions/connection/redis-connection-failed.exception';

export class RedisConnectionSentinelMasterRequiredException extends RedisConnectionFailedException {
  constructor(
    message: string = ERROR_MESSAGES.SENTINEL_MASTER_NAME_REQUIRED,
    options?: HttpExceptionOptions,
  ) {
    super(
      {
        message,
        error: 'RedisConnectionSentinelMasterRequiredException',
        statusCode: RedisConnectionFailedStatusCode,
        errorCode: CustomErrorCodes.RedisConnectionSentinelMasterRequired,
      },
      options,
    );
  }
}
