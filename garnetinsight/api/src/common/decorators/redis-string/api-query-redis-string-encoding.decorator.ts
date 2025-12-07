import { ApiQuery } from '@nestjs/swagger';
import {
  REDIS_STRING_ENCODING_QUERY_PARAM_NAME,
  RedisStringResponseEncoding,
} from 'src/common/constants';

export const ApiQueryRedisStringEncoding = () =>
  ApiQuery({
    name: REDIS_STRING_ENCODING_QUERY_PARAM_NAME,
    enum: RedisStringResponseEncoding,
  });
