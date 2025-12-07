import { CloudRequestUtm } from 'src/modules/cloud/common/models';
import { mockGetServerInfoResponse } from 'src/__mocks__/server';

export const mockCloudRequestUtm = Object.assign(new CloudRequestUtm(), {
  source: 'utm_source',
  medium: 'utm_medium',
  campaign: 'utm_campaign',
});

export const mockCalculatedUtmParameters = {
  amp: mockGetServerInfoResponse.id,
  package: mockGetServerInfoResponse.packageType,
};

export const mockCompleteCloudUtm = Object.assign(new CloudRequestUtm(), {
  ...mockCloudRequestUtm,
  ...mockCalculatedUtmParameters,
});

export const mockUtmBody = {
  utm_source: mockCloudRequestUtm.source,
  utm_medium: mockCloudRequestUtm.medium,
  utm_campaign: mockCloudRequestUtm.campaign,
};

export const mockUtmCompleteBody = {
  ...mockUtmBody,
  utm_amp: mockCompleteCloudUtm.amp,
  utm_package: mockCompleteCloudUtm.package,
};
