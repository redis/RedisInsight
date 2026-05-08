import { ApiProperty } from '@nestjs/swagger';
import { CloudSubscriptionPlan, CloudSubscriptionRegion } from '../models';

export class CloudSubscriptionPlanResponse extends CloudSubscriptionPlan {
  @ApiProperty({
    type: CloudSubscriptionRegion,
  })
  details: CloudSubscriptionRegion;
}
