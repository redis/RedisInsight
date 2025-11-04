import { AxiosError } from 'axios';
import { HttpException } from '@nestjs/common';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions/cloud-api.unauthorized.exception';
import { CloudApiForbiddenException } from 'src/modules/cloud/common/exceptions/cloud-api.forbidden.exception';
import { CloudApiBadRequestException } from 'src/modules/cloud/common/exceptions/cloud-api.bad-request.exception';
import { CloudApiNotFoundException } from 'src/modules/cloud/common/exceptions/cloud-api.not-found.exception';
import { CloudApiInternalServerErrorException } from 'src/modules/cloud/common/exceptions/cloud-api.internal-server-error.exception';

export const wrapCloudApiError = (
  error: AxiosError,
  message?: string,
): HttpException => {
  if (error instanceof HttpException) {
    return error;
  }

  const { response } = error;

  let errorMessage = message || error.message;
  if (!errorMessage) {
    const data = response?.data as any;
    errorMessage = data?.message;
  }

  if (response) {
    const errorOptions = { cause: response?.data };
    switch (response?.status) {
      case 401:
        return new CloudApiUnauthorizedException(errorMessage, errorOptions);
      case 403:
        return new CloudApiForbiddenException(errorMessage, errorOptions);
      case 400:
        return new CloudApiBadRequestException(errorMessage, errorOptions);
      case 404:
        return new CloudApiNotFoundException(errorMessage, errorOptions);
      default:
        return new CloudApiInternalServerErrorException(
          errorMessage,
          errorOptions,
        );
    }
  }

  return new CloudApiInternalServerErrorException(errorMessage);
};
