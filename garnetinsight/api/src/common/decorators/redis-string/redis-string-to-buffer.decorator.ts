import { RedisStringToBufferTransformer } from 'src/common/transformers';
import { RedisStringTransformOptions } from 'src/common/constants';

export const RedisStringToBuffer = (opts: RedisStringTransformOptions) =>
  RedisStringToBufferTransformer(opts);
