import { ApiProperty } from '@nestjs/swagger';
import { RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class ListRedisearchIndexesResponse {
  @ApiProperty({
    description: 'Indexes names',
    type: String,
  })
  @RedisStringType({ each: true })
  indexes: RedisString[];
}
