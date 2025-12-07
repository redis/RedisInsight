import { HttpStatus } from '@nestjs/common';
import errorMessages from 'src/constants/error-messages';
import { CustomErrorCodes } from 'src/constants';
import { RdiPipelineForbiddenException } from './rdi-pipeline.forbidden.exception';

describe('RdiPipelineForbiddenException', () => {
  it('should create a RdiPipelineForbiddenException with default message and status code', () => {
    const exception = new RdiPipelineForbiddenException();
    expect(exception.getStatus()).toBe(HttpStatus.FORBIDDEN);
    expect(exception.getResponse()).toEqual({
      statusCode: HttpStatus.FORBIDDEN,
      message: errorMessages.FORBIDDEN,
      error: 'RdiForbidden',
      errorCode: CustomErrorCodes.RdiForbidden,
    });
  });

  it('should create a RdiPipelineForbiddenException with custom message and status code', () => {
    const customMessage = 'Custom forbidden message';
    const exception = new RdiPipelineForbiddenException(customMessage);
    expect(exception.getStatus()).toBe(HttpStatus.FORBIDDEN);
    expect(exception.getResponse()).toEqual({
      statusCode: HttpStatus.FORBIDDEN,
      message: customMessage,
      error: 'RdiForbidden',
      errorCode: CustomErrorCodes.RdiForbidden,
    });
  });
});
