import { HttpExceptionOptions } from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  RedisConnectionFailedException,
  RedisConnectionFailedStatusCode,
} from 'src/modules/redis/exceptions/connection/redis-connection-failed.exception';

export class RedisConnectionClusterNodesUnavailableException extends RedisConnectionFailedException {
  constructor(
    message: string = ERROR_MESSAGES.DB_CLUSTER_CONNECT_FAILED,
    options?: HttpExceptionOptions,
  ) {
    super(
      {
        message,
        error: 'RedisConnectionClusterNodesUnavailableException',
        statusCode: RedisConnectionFailedStatusCode,
        errorCode: CustomErrorCodes.RedisConnectionClusterNodesUnavailable,
      },
      options,
    );
  }
}
