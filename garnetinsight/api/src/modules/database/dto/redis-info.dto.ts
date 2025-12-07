import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class RedisDatabaseStatsDto {
  @ApiProperty({
    type: String,
  })
  instantaneous_input_kbps: string | undefined;

  @ApiProperty({
    type: String,
  })
  instantaneous_ops_per_sec: string | undefined;

  @ApiProperty({
    type: String,
  })
  instantaneous_output_kbps: string | undefined;

  @ApiProperty({
    type: Number,
  })
  maxmemory_policy: string | undefined;

  @ApiProperty({
    description: 'Redis database mode',
    type: String,
  })
  numberOfKeysRange: string | undefined;

  @ApiProperty({
    description: 'Redis database role',
    type: String,
  })
  uptime_in_days: string | undefined;
}

export class RedisNodeInfoResponse {
  @ApiProperty({
    description: 'Redis database version',
    type: String,
  })
  version: string;

  @ApiPropertyOptional({
    description:
      'Value is "master" if the instance is replica of no one, ' +
      'or "slave" if the instance is a replica of some master instance',
    enum: ['master', 'slave'],
    default: 'master',
  })
  role?: 'master' | 'slave';

  @ApiPropertyOptional({
    description: 'Redis database info from server section',
    type: Object,
  })
  server?: any;

  @ApiPropertyOptional({
    description: 'Various Redis stats',
    type: RedisDatabaseStatsDto,
  })
  stats?: RedisDatabaseStatsDto;

  @ApiPropertyOptional({
    description: 'The number of Redis databases',
    type: Number,
    default: 16,
  })
  databases?: number;

  @ApiPropertyOptional({
    description: 'Total number of bytes allocated by Redis using',
    type: Number,
  })
  usedMemory?: number;

  @ApiPropertyOptional({
    description: 'Total number of keys inside Redis database',
    type: Number,
  })
  totalKeys?: number;

  @ApiPropertyOptional({
    description:
      'Number of client connections (excluding connections from replicas)',
    type: Number,
  })
  connectedClients?: number;

  @ApiPropertyOptional({
    description: 'Number of seconds since Redis server start',
    type: Number,
  })
  uptimeInSeconds?: number;

  @ApiPropertyOptional({
    description: 'The cache hit ratio represents the efficiency of cache usage',
    type: Number,
  })
  hitRatio?: number;

  @ApiPropertyOptional({
    description: 'The number of the cached lua scripts',
    type: Number,
  })
  cashedScripts?: number;
}

export class RedisDatabaseInfoResponse extends RedisNodeInfoResponse {
  @ApiProperty({
    description: 'Redis database version',
    type: String,
  })
  version: string;

  @ApiPropertyOptional({
    description: 'Nodes info',
    type: RedisNodeInfoResponse,
    isArray: true,
  })
  nodes?: RedisNodeInfoResponse[];
}

export class RedisDatabaseModuleDto {
  @ApiProperty({
    description: 'Redis module name',
    type: String,
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Redis module version',
    type: Number,
    isArray: true,
  })
  ver?: number;
}

export class RedisDatabaseHelloResponse {
  @ApiProperty({
    description: 'Redis database id',
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'Redis database server name',
    type: String,
  })
  server: string;

  @ApiProperty({
    description: 'Redis database version',
    type: String,
  })
  version: string;

  @ApiProperty({
    description: 'Redis database proto',
    type: Number,
  })
  proto: number;

  @ApiProperty({
    description: 'Redis database mode',
    type: String,
  })
  mode: 'standalone' | 'sentinel' | 'cluster';

  @ApiProperty({
    description: 'Redis database role',
    type: String,
  })
  role: 'master' | 'slave';

  @ApiProperty({
    description: 'Redis database modules',
    type: RedisDatabaseModuleDto,
    isArray: true,
  })
  modules: RedisDatabaseModuleDto[];
}
