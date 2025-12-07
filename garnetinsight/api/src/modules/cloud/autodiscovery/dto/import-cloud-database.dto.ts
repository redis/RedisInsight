import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { CloudSubscriptionType } from 'src/modules/cloud/subscription/models';

export class ImportCloudDatabaseDto {
  @ApiProperty({
    description: 'Subscription id',
    type: Number,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsInt({ always: true })
  subscriptionId: number;

  @IsEnum(CloudSubscriptionType, {
    message: `subscriptionType must be a valid enum value. Valid values: ${Object.values(
      CloudSubscriptionType,
    )}.`,
  })
  @IsNotEmpty()
  subscriptionType: CloudSubscriptionType;

  @ApiProperty({
    description: 'Database id',
    type: Number,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsInt({ always: true })
  databaseId: number;

  @ApiPropertyOptional({
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  free?: boolean;
}
