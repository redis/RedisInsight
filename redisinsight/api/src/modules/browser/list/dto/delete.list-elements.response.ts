import { ApiRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class DeleteListElementsResponse {
  @ApiRedisString('Removed elements from list', true)
  @RedisStringType({ each: true })
  elements: RedisString[];
}
