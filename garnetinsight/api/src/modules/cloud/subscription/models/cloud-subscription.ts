import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CloudSubscriptionStatus {
  Active = 'active',
  NotActivated = 'not_activated',
  Deleting = 'deleting',
  Pending = 'pending',
  Error = 'error',
}

export enum CloudSubscriptionType {
  Flexible = 'flexible',
  Fixed = 'fixed',
}

export class CloudSubscription {
  @ApiProperty({
    description: 'Subscription id',
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'Subscription name',
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'Subscription type',
    enum: CloudSubscriptionType,
  })
  type: CloudSubscriptionType;

  @ApiProperty({
    description: 'Number of databases in subscription',
    type: Number,
  })
  numberOfDatabases?: number;

  @ApiProperty({
    description: 'Subscription status',
    enum: CloudSubscriptionStatus,
    default: CloudSubscriptionStatus.Active,
  })
  status: CloudSubscriptionStatus;

  @ApiPropertyOptional({
    description: 'Subscription provider',
    type: String,
  })
  provider?: string;

  @ApiPropertyOptional({
    description: 'Subscription region',
    type: String,
  })
  region?: string;

  @ApiPropertyOptional({
    description: 'Subscription price',
    type: Number,
  })
  price?: number;

  @ApiPropertyOptional({
    description: 'Determines if subscription is 0 price',
    type: Boolean,
  })
  free?: boolean;
}
