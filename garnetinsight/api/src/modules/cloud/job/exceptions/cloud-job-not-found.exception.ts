import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export class CloudJobNotFoundException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.CLOUD_JOB_NOT_FOUND,
    options?: HttpExceptionOptions,
  ) {
    const response = {
      message,
      statusCode: HttpStatus.NOT_FOUND,
      error: 'CloudJobNotFound',
      errorCode: CustomErrorCodes.CloudJobNotFound,
    };

    super(response, response.statusCode, options);
  }
}
