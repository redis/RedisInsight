import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInstance,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { pickDefinedAgreements } from 'src/dto/dto-transformer';
import { Default } from 'src/common/decorators';
import config from 'src/utils/config';
import { IAgreementSpec } from 'src/modules/settings/models/agreements.interface';
import {
  ToggleAnalyticsReason,
  ToggleAnalyticsReasonType,
} from 'src/modules/settings/constants/settings';

const REDIS_SCAN_CONFIG = config.get('redis_scan');
const WORKBENCH_CONFIG = config.get('workbench');

export enum TimezoneOption {
  Local = 'local',
  UTC = 'UTC',
}

export class GetAgreementsSpecResponse {
  @ApiProperty({
    description: 'Version of agreements specification.',
    type: String,
    example: '1.0.0',
  })
  version: string;

  @ApiProperty({
    description: 'Agreements specification.',
    type: Object,
    example: {
      eula: {
        defaultValue: false,
        required: true,
        since: '1.0.0',
        editable: false,
        title: 'License Terms',
        label: 'I have read and understood the License Terms',
      },
    },
  })
  agreements: IAgreementSpec;
}

export class GetUserAgreementsResponse {
  @ApiProperty({
    description: 'Last version on agreements set by the user.',
    type: String,
  })
  version: string;

  eula?: boolean;

  analytics?: boolean;

  notifications?: boolean;

  @Exclude()
  encryption?: boolean;
}

export class GetAppSettingsResponse {
  @ApiProperty({
    description: 'Applied application theme.',
    type: String,
    example: 'DARK',
  })
  @Expose()
  @Default(null)
  theme: string = null;

  @ApiProperty({
    description: 'Applied application date format',
    type: String,
    example: 'yyyy-mm-dd',
  })
  @Expose()
  @Default(null)
  dateFormat: string = null;

  @ApiProperty({
    description: 'Applied application timezone',
    enum: TimezoneOption,
    example: 'local',
  })
  @Expose()
  @Default(null)
  timezone: TimezoneOption = null;

  @ApiProperty({
    description: 'Applied the threshold for scan operation.',
    type: Number,
    example: 10000,
  })
  @Expose()
  @Default(REDIS_SCAN_CONFIG.scanThreshold)
  scanThreshold: number = REDIS_SCAN_CONFIG.scanThreshold;

  @ApiProperty({
    description: 'Applied the batch of the commands for workbench.',
    type: Number,
    example: 5,
  })
  @Expose()
  @Default(WORKBENCH_CONFIG.countBatch)
  batchSize: number = WORKBENCH_CONFIG.countBatch;

  @ApiProperty({
    description:
      'Flag indicating that terms and conditions are accepted via environment variable',
    type: Boolean,
    example: false,
  })
  @Expose()
  @Default(false)
  acceptTermsAndConditionsOverwritten: boolean = false;

  @ApiProperty({
    description: 'Agreements set by the user.',
    type: GetUserAgreementsResponse,
    example: {
      version: '1.0.0',
      eula: true,
      analytics: true,
      encryption: true,
      notifications: true,
    },
  })
  @Expose()
  agreements: GetUserAgreementsResponse;
}

export class UpdateSettingsDto {
  @ApiPropertyOptional({
    description: 'Application theme.',
    type: String,
    example: 'DARK',
  })
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiPropertyOptional({
    description: 'Application date format.',
    type: String,
    example: 'yyyy-mm-dd',
  })
  @IsOptional()
  @IsString()
  dateFormat?: string;

  @ApiPropertyOptional({
    description: 'Application timezone.',
    type: String,
    example: 'local',
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({
    description: 'Threshold for scan operation.',
    type: Number,
    example: 10000,
  })
  @IsOptional()
  @IsInt({ always: true })
  @Min(500)
  scanThreshold?: number;

  @ApiPropertyOptional({
    description: 'Batch for workbench pipeline.',
    type: Number,
    example: 5,
  })
  @IsOptional()
  @IsInt({ always: true })
  @Min(0)
  batchSize?: number;

  @ApiPropertyOptional({
    description: 'Agreements',
    type: Map,
    example: {
      eula: true,
    },
  })
  @IsOptional()
  @Type(() => Map)
  @IsInstance(Map)
  @Transform(pickDefinedAgreements)
  @IsBoolean({ each: true })
  agreements?: Map<string, boolean>;

  @ApiPropertyOptional({
    description: 'Reason describing why analytics are enabled',
    type: String,
    example: 'install',
  })
  @IsOptional()
  @IsString()
  @IsEnum(ToggleAnalyticsReason)
  analyticsReason?: ToggleAnalyticsReasonType;
}
