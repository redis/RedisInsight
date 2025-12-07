import ERROR_MESSAGES from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';
import { HttpStatus } from '@nestjs/common';
import { RdiStartPipelineFailedException } from './rdi-start-pipeline-failed.exception';

describe('RdiStartPipelineFailedException', () => {
  it('should create an exception with default message and status code', () => {
    const exception = new RdiStartPipelineFailedException();
    expect(exception.message).toEqual(
      ERROR_MESSAGES.RDI_START_PIPELINE_FAILURE,
    );
    expect(exception.getStatus()).toEqual(HttpStatus.BAD_REQUEST);
    expect(exception.getResponse()).toEqual({
      message: ERROR_MESSAGES.RDI_START_PIPELINE_FAILURE,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'RdiStartPipelineFailed',
      errorCode: CustomErrorCodes.RdiStartPipelineFailure,
      errors: [undefined],
    });
  });

  it('should create an exception with custom message and error', () => {
    const customMessage = 'Custom error message';
    const customError = 'Custom error';
    const exception = new RdiStartPipelineFailedException(customMessage, {
      error: customError,
    });
    expect(exception.message).toEqual(customMessage);
    expect(exception.getStatus()).toEqual(HttpStatus.BAD_REQUEST);
    expect(exception.getResponse()).toEqual({
      message: customMessage,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'RdiStartPipelineFailed',
      errorCode: CustomErrorCodes.RdiStartPipelineFailure,
      errors: [customError],
    });
  });
});
