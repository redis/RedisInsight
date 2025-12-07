import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CloudSubscriptionType } from 'src/modules/cloud/subscription/models';
import {
  CloudDatabaseAlert,
  CloudDatabaseDataEvictionPolicy,
  CloudDatabasePersistencePolicy,
  CloudDatabaseProtocol,
} from 'src/modules/cloud/database/models';

export class CreateFreeCloudDatabaseDto {
  @ApiProperty({
    description: 'Database name',
    type: String,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Subscription Id',
    type: Number,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsInt({ always: true })
  @Type(() => Number)
  subscriptionId: number;

  @IsEnum(CloudSubscriptionType)
  @IsNotEmpty()
  subscriptionType: CloudSubscriptionType;

  @IsEnum(CloudDatabaseProtocol)
  @IsNotEmpty()
  protocol: CloudDatabaseProtocol;

  @IsEnum(CloudDatabasePersistencePolicy)
  @IsNotEmpty()
  dataPersistence: CloudDatabasePersistencePolicy;

  @IsEnum(CloudDatabaseDataEvictionPolicy)
  @IsNotEmpty()
  dataEvictionPolicy: CloudDatabaseDataEvictionPolicy;

  @IsBoolean()
  @IsNotEmpty()
  replication: boolean;

  @IsEnum(CloudDatabaseAlert, { each: true })
  @IsNotEmpty({ each: true })
  @IsArray()
  alerts: CloudDatabaseAlert[];
}
