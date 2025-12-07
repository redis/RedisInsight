import { RedisStringToASCIITransformer } from 'src/common/transformers';
import { RedisStringTransformOptions } from 'src/common/constants';

export const RedisStringToASCII = (opts: RedisStringTransformOptions) =>
  RedisStringToASCIITransformer(opts);
