import { ApiRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class ListRedisearchIndexesResponse {
  @ApiRedisString('Indexes names', true)
  @RedisStringType({ each: true })
  indexes: RedisString[];
}
