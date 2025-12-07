import { HttpStatus } from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';

export const mockCapiUnauthorizedError = {
  message: 'Custom unauthorized message',
  response: {
    status: 401,
  },
};

export const mockSmApiUnauthorizedError = mockCapiUnauthorizedError;

export const mockSmApiInternalServerError = {
  message: 'Custom server error message',
  response: {
    status: 500,
  },
};

export const mockSmApiBadRequestError = {
  message: 'Custom bad request message',
  response: {
    status: 400,
  },
};

export const mockUtm = {
  source: 'garnetinsight',
  medium: 'sso',
  campaign: 'workbench',
};

export const mockCloudApiUnauthorizedExceptionResponse = {
  error: 'CloudApiUnauthorized',
  errorCode: CustomErrorCodes.CloudApiUnauthorized,
  message: mockCapiUnauthorizedError.message,
  statusCode: HttpStatus.UNAUTHORIZED,
};

export const mockCloudApiBadRequestExceptionResponse = {
  error: 'CloudApiBadRequest',
  errorCode: CustomErrorCodes.CloudApiBadRequest,
  message: mockSmApiBadRequestError.message,
  statusCode: HttpStatus.BAD_REQUEST,
};
