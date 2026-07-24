import { AxiosError } from 'axios';
import { HttpException } from '@nestjs/common';
import { CloudApiErrorCodes } from 'src/modules/cloud/common/constants';
import { CloudApiUnauthorizedException } from 'src/modules/cloud/common/exceptions/cloud-api.unauthorized.exception';
import {
  CloudApiMfaFactors,
  CloudApiMfaRequiredException,
} from 'src/modules/cloud/common/exceptions/cloud-api.mfa-required.exception';
import { CloudApiMfaInvalidCodeException } from 'src/modules/cloud/common/exceptions/cloud-api.mfa-invalid-code.exception';
import { CloudApiMfaQuotaExceededException } from 'src/modules/cloud/common/exceptions/cloud-api.mfa-quota-exceeded.exception';
import { CloudApiForbiddenException } from 'src/modules/cloud/common/exceptions/cloud-api.forbidden.exception';
import { CloudApiBadRequestException } from 'src/modules/cloud/common/exceptions/cloud-api.bad-request.exception';
import { CloudApiNotFoundException } from 'src/modules/cloud/common/exceptions/cloud-api.not-found.exception';
import { CloudApiInternalServerErrorException } from 'src/modules/cloud/common/exceptions/cloud-api.internal-server-error.exception';

// the cloud api serializes mfa factor availability as a JSON string in errors.params
const parseMfaFactors = (params: unknown): CloudApiMfaFactors | undefined => {
  try {
    return JSON.parse(String(params));
  } catch {
    return undefined;
  }
};

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

    // cloud error codes take precedence over the http status
    switch ((response.data as any)?.errors?.code) {
      case CloudApiErrorCodes.MfaRequired:
        return new CloudApiMfaRequiredException(
          undefined,
          errorOptions,
          parseMfaFactors((response.data as any).errors.params),
        );
      case CloudApiErrorCodes.MfaInvalidCode:
        return new CloudApiMfaInvalidCodeException(undefined, errorOptions);
      case CloudApiErrorCodes.MfaQuotaExceeded:
        return new CloudApiMfaQuotaExceededException(undefined, errorOptions);
      default:
        break;
    }
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
