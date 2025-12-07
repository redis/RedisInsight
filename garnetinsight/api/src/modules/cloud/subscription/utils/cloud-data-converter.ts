import { get, toNumber } from 'lodash';
import {
  CloudSubscription,
  CloudSubscriptionPlan,
  CloudSubscriptionRegion,
  CloudSubscriptionType,
  ICloudCapiSubscription,
  ICloudApiSubscriptionCloudRegion,
  ICloudCapiSubscriptionPlan,
} from 'src/modules/cloud/subscription/models';
import { plainToInstance } from 'class-transformer';

export const parseCloudSubscriptionCapiResponse = (
  subscription: ICloudCapiSubscription,
  type: CloudSubscriptionType,
): CloudSubscription =>
  plainToInstance(CloudSubscription, {
    id: subscription.id,
    type,
    name: subscription.name,
    numberOfDatabases: subscription.numberOfDatabases,
    status: subscription.status,
    provider: get(
      subscription,
      ['cloudDetails', 0, 'provider'],
      get(subscription, 'provider'),
    ),
    region: get(
      subscription,
      ['cloudDetails', 0, 'regions', 0, 'region'],
      get(subscription, 'region'),
    ),
    price: subscription?.price,
    free: subscription?.price === 0,
  });

export const parseCloudSubscriptionsCapiResponse = (
  subscriptions: ICloudCapiSubscription[],
  type: CloudSubscriptionType,
): CloudSubscription[] => {
  const result: CloudSubscription[] = [];
  if (subscriptions?.length) {
    subscriptions?.forEach?.((subscription): void => {
      result.push(parseCloudSubscriptionCapiResponse(subscription, type));
    });
  }
  return result;
};

export const parseCloudSubscriptionsPlansCapiResponse = (
  plans: ICloudCapiSubscriptionPlan[],
  type: CloudSubscriptionType,
): CloudSubscriptionPlan[] => {
  const result: CloudSubscriptionPlan[] = [];
  if (plans?.length) {
    plans?.forEach?.((plan): void => {
      result.push(
        plainToInstance(CloudSubscriptionPlan, {
          id: plan.id,
          type,
          name: plan.name,
          provider: plan.provider,
          price: plan?.price,
          region: plan.region,
          regionId: plan.regionId,
        }),
      );
    });
  }
  return result;
};

export const parseCloudSubscriptionsCloudRegionsApiResponse = (
  regions: ICloudApiSubscriptionCloudRegion[],
): CloudSubscriptionRegion[] => {
  const result: CloudSubscriptionRegion[] = [];
  if (regions?.length) {
    regions?.forEach?.((plan): void => {
      result.push(
        plainToInstance(CloudSubscriptionRegion, {
          id: toNumber(plan.id),
          name: plan.name,
          cloud: plan.cloud,
          displayOrder: plan.display_order,
          countryName: plan.country_name,
          cityName: plan.city_name,
          regionId: plan.region_id,
          flag: plan?.flag,
        }),
      );
    });
  }
  return result;
};
