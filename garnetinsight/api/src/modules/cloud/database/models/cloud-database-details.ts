import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CloudSubscriptionType } from 'src/modules/cloud/subscription/models/cloud-subscription';

export class CloudDatabaseDetails {
  @ApiProperty({
    description: 'Database id from the cloud',
    type: Number,
  })
  @Expose()
  @IsNotEmpty()
  @IsInt({ always: true })
  cloudId: number;

  @ApiProperty({
    description: 'Subscription id from the cloud',
    type: Number,
  })
  @Expose()
  @IsOptional()
  subscriptionId: number;

  @ApiProperty({
    description: 'Subscription type',
    enum: () => CloudSubscriptionType,
    example: CloudSubscriptionType.Flexible,
  })
  @Expose()
  @IsNotEmpty()
  @IsEnum(CloudSubscriptionType, {
    message: `subscriptionType must be a valid enum value. Valid values: ${Object.values(
      CloudSubscriptionType,
    )}.`,
  })
  subscriptionType: CloudSubscriptionType;

  @ApiPropertyOptional({
    description: 'Plan memory limit',
    type: Number,
    example: 256,
  })
  @Expose()
  @IsOptional()
  @IsNumber()
  planMemoryLimit?: number;

  @ApiPropertyOptional({
    description: 'Memory limit units',
    type: String,
    example: 'MB',
  })
  @Expose()
  @IsOptional()
  @IsString()
  memoryLimitMeasurementUnit?: string;

  @ApiPropertyOptional({
    description: 'Is free database',
    type: Boolean,
    example: false,
  })
  @Expose()
  @IsOptional()
  @IsBoolean()
  free?: boolean;

  @ApiPropertyOptional({
    description: 'Is subscription using bdb packages',
    type: Boolean,
    example: false,
  })
  @Expose()
  @IsOptional()
  @IsBoolean()
  isBdbPackage?: boolean;
}
