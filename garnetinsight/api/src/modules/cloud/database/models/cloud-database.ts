import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { CloudSubscriptionType } from 'src/modules/cloud/subscription/models/cloud-subscription';
import { CloudDatabaseDetails } from 'src/modules/cloud/database/models/cloud-database-details';
import { IsArray, IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { Tag } from 'src/modules/tag/models/tag';

export enum CloudDatabaseProtocol {
  Redis = 'redis',
  Stack = 'stack',
  Memcached = 'memcached',
}

export enum CloudDatabasePersistencePolicy {
  AofEveryOneSecond = 'aof-every-1-second',
  AofEveryWrite = 'aof-every-write',
  SnapshotEveryOneHour = 'snapshot-every-1-hour',
  SnapshotEverySixHours = 'snapshot-every-6-hours',
  SnapshotEveryTwelveHours = 'snapshot-every-12-hours',
  None = 'none',
}

export enum CloudDatabaseDataEvictionPolicy {
  AllKeysLru = 'allkeys-lru',
  AllKeysLfu = 'allkeys-lfu',
  AllKeysRandom = 'allkeys-random',
  VolatileLru = 'volatile-lru',
  VolatileLfu = 'volatile-lfu',
  VolatileRandom = 'volatile-random',
  VolatileTtl = 'volatile-ttl',
  NoEviction = 'noeviction',
}

export enum CloudDatabaseMemoryStorage {
  Ram = 'ram',
  RamAndFlash = 'ram-and-flash',
}

export enum CloudDatabaseStatus {
  Draft = 'draft',
  Pending = 'pending',
  CreationFailed = 'creation-failed',
  Active = 'active',
  ActiveChangePending = 'active-change-pending',
  ImportPending = 'import-pending',
  DeletePending = 'delete-pending',
  Recovery = 'recovery',
}

export enum CloudDatabaseAlertName {
  DatasetSize = 'dataset-size',
  DatasetsSize = 'datasets-size',
  ThroughputHigherThan = 'throughput-higher-than',
  ThroughputLowerThan = 'throughput-lower-than',
  Latency = 'latency',
  SyncSourceError = 'syncsource-error',
  SyncSourceLag = 'syncsource-lag',
  ConnectionsLimit = 'connections-limit',
}

export class CloudDatabaseAlert {
  @ApiProperty({
    description: 'Database alert name',
    type: String,
  })
  @Expose()
  @IsEnum(CloudDatabaseAlertName)
  @IsNotEmpty()
  name: CloudDatabaseAlertName;

  @ApiProperty({
    description: 'Database alert value',
    type: Number,
  })
  @Expose()
  @IsInt()
  @IsNotEmpty()
  value: number;
}

export class CloudDatabase {
  @ApiProperty({
    description: 'Subscription id',
    type: Number,
  })
  @Expose()
  subscriptionId: number;

  @ApiProperty({
    description: 'Subscription type',
    enum: CloudSubscriptionType,
  })
  @Expose()
  subscriptionType: CloudSubscriptionType;

  @ApiProperty({
    description: 'Database id',
    type: Number,
  })
  @Expose()
  databaseId: number;

  @ApiProperty({
    description: 'Database name',
    type: String,
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Address your Redis Cloud database is available on',
    type: String,
  })
  @Expose()
  publicEndpoint: string;

  @ApiProperty({
    description: 'Database status',
    enum: CloudDatabaseStatus,
    default: CloudDatabaseStatus.Active,
  })
  @Expose()
  status: CloudDatabaseStatus;

  @ApiProperty({
    description: 'Is ssl authentication enabled or not',
    type: Boolean,
  })
  @Expose()
  sslClientAuthentication: boolean;

  @ApiProperty({
    description: 'Information about the modules loaded to the database',
    type: String,
    isArray: true,
  })
  @Expose()
  modules: string[];

  @ApiProperty({
    description: 'Additional database options',
    type: Object,
  })
  @Expose()
  options: any;

  @Expose({ groups: ['security'] })
  password?: string;

  @Expose()
  @Type(() => CloudDatabaseDetails)
  cloudDetails?: CloudDatabaseDetails;

  @ApiProperty({
    description: 'Tags associated with the database.',
    type: Tag,
    isArray: true,
  })
  @Expose()
  @IsArray()
  @Type(() => Tag)
  tags: Tag[];
}
