import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CloudSubscriptionType } from 'src/modules/cloud/subscription/models';

export class GetCloudSubscriptionDatabasesDto {
  @ApiProperty({
    description: 'Subscription Id',
    type: Number,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsInt({ always: true })
  @Type(() => Number)
  subscriptionId: number;

  @ApiProperty({
    description: 'Subscription Id',
    enum: CloudSubscriptionType,
  })
  @IsEnum(CloudSubscriptionType, {
    message: `subscriptionType must be a valid enum value. Valid values: ${Object.values(
      CloudSubscriptionType,
    )}.`,
  })
  @IsNotEmpty()
  subscriptionType: CloudSubscriptionType;

  @ApiPropertyOptional({
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  free?: boolean;
}
