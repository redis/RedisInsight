import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { Exclude, Type } from 'class-transformer';
import { RedisEnterpriseDatabaseStatus } from 'src/modules/redis-enterprise/models/redis-enterprise-database';
import { NoDuplicatesByKey } from 'src/common/decorators';
import { CreateTagDto } from 'src/modules/tag/dto';

export class ClusterConnectionDetailsDto {
  @ApiProperty({
    description: 'The hostname of your Redis Enterprise.',
    type: String,
    default: 'localhost',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString({ always: true })
  host: string;

  @ApiProperty({
    description: 'The port your Redis Enterprise cluster is available on.',
    type: Number,
    default: 9443,
  })
  @IsDefined()
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt({ always: true })
  port: number;

  @ApiProperty({
    description: 'The admin e-mail/username',
    type: String,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString({ always: true })
  username: string;

  @ApiProperty({
    description: 'The admin password',
    type: String,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString({ always: true })
  password: string;
}

export class RedisEnterpriseDatabase {
  @ApiProperty({
    description: 'The unique ID of the database.',
    type: Number,
  })
  uid: number;

  @ApiProperty({
    description: 'Name of database in cluster.',
    type: String,
  })
  name: string;

  @ApiProperty({
    description:
      'DNS name your Redis Enterprise cluster database is available on.',
    type: String,
  })
  dnsName: string;

  @ApiProperty({
    description:
      'Address your Redis Enterprise cluster database is available on.',
    type: String,
  })
  address: string;

  @ApiProperty({
    description:
      'The port your Redis Enterprise cluster database is available on.',
    type: Number,
  })
  port: number;

  @ApiProperty({
    description: 'Database status',
    enum: RedisEnterpriseDatabaseStatus,
    default: RedisEnterpriseDatabaseStatus.Active,
  })
  status: RedisEnterpriseDatabaseStatus;

  @ApiProperty({
    description: 'Information about the modules loaded to the database',
    type: String,
    isArray: true,
  })
  modules: string[];

  @ApiProperty({
    description: 'Is TLS mode enabled?',
    type: Boolean,
  })
  tls: boolean;

  @ApiProperty({
    description: 'Additional database options',
    type: Object,
  })
  options: any;

  @ApiProperty({
    description: 'Tags associated with the database.',
    type: CreateTagDto,
    isArray: true,
  })
  @IsArray()
  @NoDuplicatesByKey('key', {
    message: 'Tags must not contain duplicates by key.',
  })
  @Type(() => CreateTagDto)
  tags: CreateTagDto[];

  @Exclude()
  password: string | null;

  constructor(partial: Partial<RedisEnterpriseDatabase>) {
    Object.assign(this, partial);
  }
}
