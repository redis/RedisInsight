import { HttpStatus } from '@nestjs/common';
import errorMessages from 'src/constants/error-messages';
import { RdiPipelineTimeoutException } from './rdi-pipeline.timeout-error.exception';

describe('RdiPipelineTimeoutException', () => {
  it('should create a RdiPipelineTimeoutException with default message and status code', () => {
    const exception = new RdiPipelineTimeoutException();
    expect(exception.getStatus()).toBe(HttpStatus.REQUEST_TIMEOUT);
    expect(exception.getResponse()).toEqual({
      statusCode: HttpStatus.REQUEST_TIMEOUT,
      message: errorMessages.RDI_TIMEOUT_ERROR,
      error: 'Timeout Error',
    });
  });

  it('should create a RdiPipelineTimeoutException with custom message and status code', () => {
    const customMessage = 'Custom timeout message';
    const exception = new RdiPipelineTimeoutException(customMessage);
    expect(exception.getStatus()).toBe(HttpStatus.REQUEST_TIMEOUT);
    expect(exception.getResponse()).toEqual({
      statusCode: HttpStatus.REQUEST_TIMEOUT,
      message: customMessage,
      error: 'Timeout Error',
    });
  });
});
