import { HttpExceptionOptions } from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  RedisConnectionFailedException,
  RedisConnectionFailedStatusCode,
} from 'src/modules/redis/exceptions/connection/redis-connection-failed.exception';

export class RedisConnectionIncorrectCertificateException extends RedisConnectionFailedException {
  constructor(
    message: string = ERROR_MESSAGES.INCORRECT_CERTIFICATES('this host'),
    options?: HttpExceptionOptions,
  ) {
    super(
      {
        message,
        error: 'RedisConnectionIncorrectCertificateException',
        statusCode: RedisConnectionFailedStatusCode,
        errorCode: CustomErrorCodes.RedisConnectionIncorrectCertificate,
      },
      options,
    );
  }
}
