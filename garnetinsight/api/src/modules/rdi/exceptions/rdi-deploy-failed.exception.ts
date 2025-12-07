import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';

export class RdiPipelineDeployFailedException extends HttpException {
  constructor(
    message = ERROR_MESSAGES.RDI_DEPLOY_PIPELINE_FAILURE,
    options?: HttpExceptionOptions & { error?: string },
  ) {
    const response = {
      message,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'RdiPipelineDeployFailed',
      errorCode: CustomErrorCodes.RdiDeployPipelineFailure,
      errors: [options?.error],
    };

    super(response, response.statusCode, options);
  }
}
