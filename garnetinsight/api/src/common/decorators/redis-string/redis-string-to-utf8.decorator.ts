import { RedisStringToUTF8Transformer } from 'src/common/transformers';
import { RedisStringTransformOptions } from 'src/common/constants';

export const RedisStringToUTF8 = (opts: RedisStringTransformOptions) =>
  RedisStringToUTF8Transformer(opts);
