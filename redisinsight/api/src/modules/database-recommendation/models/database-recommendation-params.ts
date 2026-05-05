import { RedisString } from 'src/common/constants';
import {
  ApiRedisString,
  IsRedisString,
  RedisStringType,
} from 'src/common/decorators';

export class DatabaseRecommendationParams {
  @ApiRedisString('keys', true)
  @IsRedisString({ each: true })
  @RedisStringType({ each: true })
  keys?: RedisString[];
}
