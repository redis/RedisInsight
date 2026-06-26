import { HttpException, HttpStatus } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export class RdiPipelineTimeoutException extends HttpException {
  constructor(message = ERROR_MESSAGES.RDI_TIMEOUT_ERROR) {
    super(
      {
        statusCode: HttpStatus.REQUEST_TIMEOUT,
        errorCode: CustomErrorCodes.RdiTimeout,
        message,
        error: 'Timeout Error',
      },
      HttpStatus.REQUEST_TIMEOUT,
    );
  }
}
