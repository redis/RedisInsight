import { HttpExceptionOptions } from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  RedisConnectionFailedException,
  RedisConnectionFailedStatusCode,
} from 'src/modules/redis/exceptions/connection/redis-connection-failed.exception';

export class RedisConnectionIncorrectCertificateException extends RedisConnectionFailedException {
  constructor(url: string = 'this host', options?: HttpExceptionOptions) {
    super(
      {
        message: ERROR_MESSAGES.INCORRECT_CERTIFICATES(url),
        error: 'RedisConnectionIncorrectCertificateException',
        statusCode: RedisConnectionFailedStatusCode,
        errorCode: CustomErrorCodes.RedisConnectionIncorrectCertificate,
        resource: { url },
      },
      options,
    );
  }
}
