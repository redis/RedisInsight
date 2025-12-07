import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { CloudJobName } from 'src/modules/cloud/job/constants';
import { HttpException } from '@nestjs/common';

export enum CloudJobRunMode {
  Async = 'async',
  Sync = 'sync',
}

export enum CloudJobStatus {
  Initializing = 'initializing',
  Running = 'running',
  Finished = 'finished',
  Failed = 'failed',
}

export enum CloudJobStep {
  Credentials = 'credentials',
  Subscription = 'subscription',
  Database = 'database',
  Import = 'import',
}

export class CloudJobInfo {
  @ApiProperty({
    type: String,
  })
  @Expose()
  id: string;

  @ApiProperty({
    enum: CloudJobName,
  })
  @Expose()
  name: CloudJobName;

  @ApiProperty({
    enum: CloudJobStatus,
  })
  @Expose()
  status: CloudJobStatus;

  @ApiPropertyOptional({
    description: 'Children job if any',
    type: () => CloudJobInfo,
  })
  @Expose()
  @Type(() => CloudJobInfo)
  child?: CloudJobInfo;

  @ApiPropertyOptional({
    description: 'Error if any',
    type: () => HttpException,
  })
  @Expose()
  error?: string | object;

  @ApiPropertyOptional({
    description: 'Job result',
  })
  @Expose()
  result?: any;

  @ApiPropertyOptional({
    description: 'Job step',
  })
  @Expose()
  step?: CloudJobStep;
}
