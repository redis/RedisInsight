import { RedisString } from 'src/common/constants';
import { IsRedisString, RedisStringType } from 'src/common/decorators';

export class DatabaseRecommendationParams {
  @IsRedisString({ each: true })
  @RedisStringType({ each: true })
  keys?: RedisString[];
}
