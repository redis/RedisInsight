import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { CloudSubscriptionType } from 'src/modules/cloud/subscription/models';

export class CreateFreeCloudSubscriptionDto {
  @ApiProperty({
    description: 'Subscription name',
    type: String,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Subscription plan id',
    type: Number,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsInt()
  planId: number;

  @IsEnum(CloudSubscriptionType)
  @IsNotEmpty()
  subscriptionType: CloudSubscriptionType;
}
