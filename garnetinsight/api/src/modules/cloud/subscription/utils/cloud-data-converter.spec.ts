import {
  mockCloudCapiSubscription,
  mockCloudSubscription,
  mockCloudApiCloudRegion1,
  mockCloudSubscriptionRegion1,
} from 'src/__mocks__/cloud-subscription';
import {
  CloudSubscriptionType,
  ICloudCapiSubscriptionPlan,
  CloudSubscriptionPlan,
} from 'src/modules/cloud/subscription/models';
import {
  parseCloudSubscriptionCapiResponse,
  parseCloudSubscriptionsCapiResponse,
  parseCloudSubscriptionsPlansCapiResponse,
  parseCloudSubscriptionsCloudRegionsApiResponse,
} from './cloud-data-converter';

const mockCloudCapiSubscriptionPlan: ICloudCapiSubscriptionPlan = {
  id: 1,
  regionId: 1,
  name: 'Cache 30MB',
  provider: 'AWS',
  region: 'us-east-1',
  price: 0,
};

export const mockCloudSubscriptionPlan: CloudSubscriptionPlan = {
  ...mockCloudCapiSubscriptionPlan,
  type: CloudSubscriptionType.Fixed,
};

describe('parseCloudSubscriptionCapiResponse', () => {
  it('Should return subscription', () => {
    expect(
      parseCloudSubscriptionCapiResponse(
        mockCloudCapiSubscription,
        CloudSubscriptionType.Flexible,
      ),
    ).toEqual(mockCloudSubscription);
  });
});

describe('parseCloudSubscriptionCapiResponse', () => {
  it('Should return empty array', () => {
    expect(
      parseCloudSubscriptionsCapiResponse([], CloudSubscriptionType.Flexible),
    ).toEqual([]);
  });

  it('Should return parsed array of subscriptions', () => {
    expect(
      parseCloudSubscriptionsCapiResponse(
        [mockCloudCapiSubscription],
        CloudSubscriptionType.Flexible,
      ),
    ).toEqual([mockCloudSubscription]);
  });
});

describe('parseCloudSubscriptionsPlansCapiResponse', () => {
  it('Should return parsed array of regions', () => {
    expect(
      parseCloudSubscriptionsPlansCapiResponse(
        [mockCloudCapiSubscriptionPlan],
        CloudSubscriptionType.Fixed,
      ),
    ).toEqual([mockCloudSubscriptionPlan]);
  });
});

describe('parseCloudSubscriptionsCloudRegionsApiResponse', () => {
  it('Should return empty array', () => {
    expect(parseCloudSubscriptionsCloudRegionsApiResponse([])).toEqual([]);
  });

  it('Should return parsed array of regions', () => {
    expect(
      parseCloudSubscriptionsCloudRegionsApiResponse([
        mockCloudApiCloudRegion1,
      ]),
    ).toEqual([mockCloudSubscriptionRegion1]);
  });
});
