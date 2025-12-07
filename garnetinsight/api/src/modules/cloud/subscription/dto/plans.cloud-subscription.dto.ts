import { CloudSubscriptionPlan, CloudSubscriptionRegion } from '../models';

export class CloudSubscriptionPlanResponse extends CloudSubscriptionPlan {
  details: CloudSubscriptionRegion;
}
