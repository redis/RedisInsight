import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import { Expose, Type } from 'class-transformer';

export class KeyIndexesDto {
  @ApiProperty({
    description: 'Key name to look up matching indexes for',
    type: String,
  })
  @IsDefined()
  @RedisStringType()
  @IsRedisString()
  key: RedisString;
}

export class IndexSummaryDto {
  @ApiProperty({
    description: 'Index name',
    type: String,
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Key prefixes that this index covers',
    type: String,
    isArray: true,
  })
  @Expose()
  prefixes: string[];

  @ApiProperty({
    description: 'Key type (HASH or JSON)',
    type: String,
  })
  @Expose()
  key_type: string;
}

export class KeyIndexesResponse {
  @ApiProperty({
    description: 'Indexes that cover the given key',
    type: IndexSummaryDto,
    isArray: true,
  })
  @Expose()
  @Type(() => IndexSummaryDto)
  indexes: IndexSummaryDto[];
}
