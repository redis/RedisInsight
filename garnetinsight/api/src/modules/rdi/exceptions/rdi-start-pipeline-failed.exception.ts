import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export class RdiStartPipelineFailedException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.RDI_START_PIPELINE_FAILURE,
    options?: HttpExceptionOptions & { error?: string },
  ) {
    const response = {
      message,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'RdiStartPipelineFailed',
      errorCode: CustomErrorCodes.RdiStartPipelineFailure,
      errors: [options?.error],
    };

    super(response, response.statusCode, options);
  }
}
