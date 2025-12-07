import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class CreateSubscriptionAndDatabaseCloudJobDataDto {
  @ApiProperty({
    description: 'Plan id for create a subscription.',
    type: Number,
  })
  @ValidateIf((object) => !object.isRecommendedSettings)
  @IsNumber()
  @IsNotEmpty()
  planId: number;

  @ApiPropertyOptional({
    description: 'Use recommended settings',
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  isRecommendedSettings?: boolean;
}
