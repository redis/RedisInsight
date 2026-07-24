import { AxiosError } from 'axios';
import { HttpStatus } from '@nestjs/common';
import { CustomErrorCodes } from 'src/constants';
import {
  CloudApiBadRequestException,
  CloudApiForbiddenException,
  CloudApiInternalServerErrorException,
  CloudApiMfaInvalidCodeException,
  CloudApiMfaQuotaExceededException,
  CloudApiMfaRequiredException,
  CloudApiNotFoundException,
  CloudApiUnauthorizedException,
  wrapCloudApiError,
} from 'src/modules/cloud/common/exceptions';

const mockCloudApiError = (status: number, data: unknown = null): AxiosError =>
  ({
    name: '',
    message: `Request failed with status code ${status}`,
    isAxiosError: true,
    config: null,
    response: {
      statusText: '',
      data,
      headers: {},
      config: null,
      status,
    },
    toJSON: () => null,
  }) as unknown as AxiosError;

const mockMfaFactors = {
  phoneNumber: '+15551234567',
  smsFactorAvailable: false,
  totpFactorAvailable: true,
};

describe('wrapCloudApiError', () => {
  it('should return the error untouched when it is already an HttpException', () => {
    const error = new CloudApiNotFoundException();

    expect(wrapCloudApiError(error as unknown as AxiosError)).toBe(error);
  });

  test.each([
    [400, CloudApiBadRequestException],
    [401, CloudApiUnauthorizedException],
    [403, CloudApiForbiddenException],
    [404, CloudApiNotFoundException],
    [429, CloudApiInternalServerErrorException],
    [500, CloudApiInternalServerErrorException],
  ])('should map status %i by default', (status, exception) => {
    expect(wrapCloudApiError(mockCloudApiError(status))).toBeInstanceOf(
      exception,
    );
  });

  describe('mfa errors', () => {
    it('should map user-mfa-required to CloudApiMfaRequiredException with parsed factors', () => {
      const error = wrapCloudApiError(
        mockCloudApiError(401, {
          errors: {
            code: 'user-mfa-required',
            params: JSON.stringify(mockMfaFactors),
          },
        }),
      );

      expect(error).toBeInstanceOf(CloudApiMfaRequiredException);
      expect(error.getResponse()).toMatchObject({
        statusCode: HttpStatus.UNAUTHORIZED,
        errorCode: CustomErrorCodes.CloudApiMfaRequired,
        factors: mockMfaFactors,
      });
    });

    it('should map user-mfa-required without factors when params are not valid JSON', () => {
      const error = wrapCloudApiError(
        mockCloudApiError(401, {
          errors: { code: 'user-mfa-required', params: 'not-json' },
        }),
      );

      expect(error).toBeInstanceOf(CloudApiMfaRequiredException);
      const response = error.getResponse() as Record<string, unknown>;
      expect(response).toMatchObject({
        errorCode: CustomErrorCodes.CloudApiMfaRequired,
      });
      expect(response.factors).toBeUndefined();
    });

    test.each([401, 429])(
      'should map mfa-quota-exceeded to CloudApiMfaQuotaExceededException regardless of status (%i)',
      (status) => {
        const error = wrapCloudApiError(
          mockCloudApiError(status, {
            errors: { code: 'mfa-quota-exceeded' },
          }),
        );

        expect(error).toBeInstanceOf(CloudApiMfaQuotaExceededException);
        expect(error.getResponse()).toMatchObject({
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          errorCode: CustomErrorCodes.CloudApiMfaQuotaExceeded,
        });
      },
    );

    it('should map mfa-invalid-code to CloudApiMfaInvalidCodeException', () => {
      const error = wrapCloudApiError(
        mockCloudApiError(400, {
          errors: { code: 'mfa-invalid-code' },
        }),
      );

      expect(error).toBeInstanceOf(CloudApiMfaInvalidCodeException);
      expect(error.getResponse()).toMatchObject({
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: CustomErrorCodes.CloudApiMfaInvalidCode,
      });
    });

    it('should keep default status mapping for unknown cloud error codes', () => {
      const error = wrapCloudApiError(
        mockCloudApiError(401, {
          errors: { code: 'some-other-error' },
        }),
      );

      expect(error).toBeInstanceOf(CloudApiUnauthorizedException);
    });
  });
});
