import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { Endpoint } from 'src/common/models';

export enum SentinelMasterStatus {
  Active = 'active',
  Down = 'down',
}

export class SentinelMaster {
  @ApiProperty({
    description:
      'Sentinel master group name. Identifies a group of Redis instances composed of a master and one or more slaves.',
    type: String,
  })
  @Expose()
  @IsString({ always: true })
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description:
      'Sentinel username, if your database is ACL enabled, otherwise leave this field empty.',
    type: String,
  })
  @Expose()
  @IsString({ always: true })
  @IsNotEmpty()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({
    description:
      'The password for your Redis Sentinel master. ' +
      'If your master doesn’t require a password, leave this field empty.',
    type: String,
  })
  @Expose()
  @IsString({ always: true })
  @IsNotEmpty()
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    description: 'The hostname of Sentinel master.',
    type: String,
    default: 'localhost',
  })
  @Expose()
  @IsString({ always: true })
  @IsNotEmpty()
  @IsOptional()
  host?: string;

  @ApiPropertyOptional({
    description: 'The port Sentinel master.',
    type: Number,
    default: 6379,
  })
  @Expose()
  @IsInt({ always: true })
  @IsNotEmpty()
  @IsOptional()
  port?: number;

  @ApiPropertyOptional({
    description: 'Sentinel master status',
    enum: SentinelMasterStatus,
    default: SentinelMasterStatus.Active,
  })
  status?: SentinelMasterStatus;

  @ApiPropertyOptional({
    description: 'The number of slaves.',
    type: Number,
    default: 0,
  })
  numberOfSlaves?: number;

  @ApiPropertyOptional({
    description: 'Sentinel master endpoints.',
    type: Endpoint,
    isArray: true,
  })
  nodes?: Endpoint[];
}
