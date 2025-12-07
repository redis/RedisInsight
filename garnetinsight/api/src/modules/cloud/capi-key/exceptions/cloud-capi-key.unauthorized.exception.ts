import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import ERROR_MESSAGES from 'src/constants/error-messages';

export class CloudCapiKeyUnauthorizedException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.CLOUD_CAPI_KEY_UNAUTHORIZED,
    options?: HttpExceptionOptions & { resourceId?: string },
  ) {
    const response = {
      message,
      statusCode: HttpStatus.UNAUTHORIZED,
      error: 'CloudCapiKeyUnauthorized',
      errorCode: CustomErrorCodes.CloudCapiKeyUnauthorized,
      resourceId: options?.resourceId,
    };

    super(response, response.statusCode, options);
  }
}
