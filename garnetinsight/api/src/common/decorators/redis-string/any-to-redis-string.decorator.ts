import { AnyToRedisStringTransformer } from 'src/common/transformers';
import { RedisStringTransformOptions } from 'src/common/constants';

export const AnyToRedisString = (opts: RedisStringTransformOptions) =>
  AnyToRedisStringTransformer(opts);
