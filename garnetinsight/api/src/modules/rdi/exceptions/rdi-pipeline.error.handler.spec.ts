import { AxiosError } from 'axios';
import { HttpStatus } from '@nestjs/common';
import {
  RdiPipelineInternalServerErrorException,
  RdiPipelineUnauthorizedException,
  RdiPipelineNotFoundException,
  RdiPipelineValidationException,
} from 'src/modules/rdi/exceptions';
import { CustomErrorCodes } from 'src/constants';
import errorMessages from 'src/constants/error-messages';
import { wrapRdiPipelineError } from './rdi-pipeline.error.handler';
import { RdiPipelineForbiddenException } from './rdi-pipeline.forbidden.exception';

describe('wrapRdiPipelineError', () => {
  it('should return the original error if it is an instance of HttpException', () => {
    const error = new RdiPipelineNotFoundException();
    const result = wrapRdiPipelineError(error as any);
    expect(result).toBe(error);
  });

  it('should return a RdiPipelineUnauthorizedException if the response status is 401', () => {
    const error = {
      response: {
        status: 401,
        data: {
          detail: {
            message: 'Unauthorized',
          },
        },
      },
    } as AxiosError;
    const result = wrapRdiPipelineError(error);

    expect(result).toBeInstanceOf(RdiPipelineUnauthorizedException);
    expect(result.getResponse()).toEqual({
      message: result.message,
      statusCode: HttpStatus.UNAUTHORIZED,
      error: 'RdiUnauthorized',
      errorCode: CustomErrorCodes.RdiUnauthorized,
    });
  });

  it('should return a RdiPipelineUnauthorizedException with a default unauthorized message if the response status is 401 and message is not provided', () => {
    const error = {
      response: {
        status: 401,
        data: {
          detail: {
            message: 'Unauthorized',
          },
        },
      },
    } as AxiosError;
    const result = wrapRdiPipelineError(error);

    expect(result).toBeInstanceOf(RdiPipelineUnauthorizedException);
    expect(result.message).toBe('Unauthorized');
  });

  it('should return a RdiPipelineForbiddenException if the response status is 403', () => {
    const error = {
      response: {
        status: 403,
        data: {
          detail: {
            message: 'Unauthorized',
          },
        },
      },
    } as AxiosError;
    const result = wrapRdiPipelineError(error);

    expect(result).toBeInstanceOf(RdiPipelineForbiddenException);
    expect(result.getResponse()).toEqual({
      message: result.message,
      statusCode: HttpStatus.FORBIDDEN,
      error: 'RdiForbidden',
      errorCode: CustomErrorCodes.RdiForbidden,
    });
  });

  it('should return a RdiPipelineValidationException if the response status is 422', () => {
    const errorDetails = {
      errors: {
        email: ['Email is invalid'],
      },
    };
    const error = {
      response: {
        status: 422,
        data: {
          detail: errorDetails,
        },
      },
    } as AxiosError;
    const result = wrapRdiPipelineError(error);
    expect(result).toBeInstanceOf(RdiPipelineValidationException);
    expect(result.getResponse()).toEqual({
      message: result.message,
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      error: 'RdiValidationError',
      errorCode: CustomErrorCodes.RdiValidationError,
      details: errorDetails,
    });
  });

  it('should return a RdiPipelineValidationException with a default validation message if the response status is 422 and message is not provided', () => {
    const errorDetails = {
      errors: {
        email: ['Email is invalid'],
      },
    };
    const error = {
      response: {
        status: 422,
        data: {
          detail: errorDetails,
        },
      },
    } as AxiosError;
    const result = wrapRdiPipelineError(error);
    expect(result).toBeInstanceOf(RdiPipelineValidationException);
    expect(result.message).toBe(errorMessages.RDI_VALIDATION_ERROR);
  });

  it('should return a RdiPipelineNotFoundException if the response status is not 401 or 422', () => {
    const errorDetails = {
      message: 'Not found',
      details: 'User was not found',
    };

    const error = {
      response: {
        status: 404,
        data: {
          detail: errorDetails,
        },
      },
    } as AxiosError;
    const result = wrapRdiPipelineError(error);
    expect(result).toBeInstanceOf(RdiPipelineNotFoundException);
    expect(result.getResponse()).toEqual({
      message: result.message,
      statusCode: HttpStatus.NOT_FOUND,
      error: 'RdiNotFound',
      errorCode: CustomErrorCodes.RdiNotFound,
      details: errorDetails.details,
    });
  });

  it('should return a RdiPipelineInternalServerErrorException if there is no response', () => {
    const error = {} as AxiosError;
    const result = wrapRdiPipelineError(error);
    expect(result).toBeInstanceOf(RdiPipelineInternalServerErrorException);
    expect(result.message).toBe(errorMessages.INTERNAL_SERVER_ERROR);
    expect(result.getResponse()).toEqual({
      message: errorMessages.INTERNAL_SERVER_ERROR,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'RdiInternalServerError',
    });
  });
});
