import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CloudSubscriptionType } from 'src/modules/cloud/subscription/models/cloud-subscription';

export enum CloudSubscriptionPlanProvider {
  AWS = 'AWS',
  GCP = 'GCP',
  Azure = 'Azure',
}

export class CloudSubscriptionPlan {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: Number,
  })
  regionId: number;

  @ApiProperty({
    description: 'Subscription type',
    enum: CloudSubscriptionType,
  })
  type: CloudSubscriptionType;

  @ApiProperty({
    type: String,
  })
  name: string;

  @ApiProperty({
    type: String,
  })
  provider: string;

  @ApiPropertyOptional({
    type: String,
  })
  region?: string;

  @ApiPropertyOptional({
    type: Number,
  })
  price?: number;
}
