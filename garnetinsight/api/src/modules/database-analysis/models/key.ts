import { RedisString } from 'src/common/constants';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class Key {
  @ApiProperty({
    description: 'Key name',
    type: String,
    example: 'key1',
  })
  @IsRedisString()
  @Expose()
  @RedisStringType()
  name: RedisString;

  @ApiProperty({
    description: 'Key type',
    type: String,
    example: 'list',
  })
  @Expose()
  type: string;

  @ApiProperty({
    description: 'Memory used by key in bytes',
    type: Number,
    example: 1_000,
  })
  @Expose()
  memory: number;

  @ApiProperty({
    description: 'Number of characters, elements, etc. based on type',
    type: Number,
    example: 100,
  })
  @Expose()
  length: number;

  @ApiProperty({
    description: 'Key ttl',
    type: Number,
    example: -1,
  })
  @Expose()
  ttl: number;
}
