import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export class RdiResetPipelineFailedException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.RDI_RESET_PIPELINE_FAILURE,
    options?: HttpExceptionOptions & { error?: string },
  ) {
    const response = {
      message,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'RdiResetPipelineFailed',
      errorCode: CustomErrorCodes.RdiResetPipelineFailure,
      errors: [options?.error],
    };

    super(response, response.statusCode, options);
  }
}
