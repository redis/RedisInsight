import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import { AxiosError } from 'axios';
import { CloudApiMfaFactors } from 'src/modules/cloud/common/exceptions/cloud-api.mfa-required.exception';

export const cloudApiMfaFactorsFactory = Factory.define<CloudApiMfaFactors>(
  () => ({
    phoneNumber: faker.phone.number(),
    smsFactorAvailable: false,
    totpFactorAvailable: true,
  }),
);

/**
 * Builds the AxiosError shape that `wrapCloudApiError` inspects for a given
 * status and response body.
 */
export const buildCloudApiError = (
  status: number,
  data: unknown = null,
): AxiosError =>
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
