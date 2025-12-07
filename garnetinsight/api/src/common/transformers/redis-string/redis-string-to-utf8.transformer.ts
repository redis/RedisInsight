import { isArray } from 'lodash';
import { RedisStringTransformOptions } from 'src/common/constants';
import { Transform } from 'class-transformer';

const SingleRedisStringToUTF8 = ({ value }) => {
  if (value instanceof Buffer) {
    return value.toString('utf8');
  }

  return value;
};

const ArrayRedisStringToUTF8 = ({ value }) => {
  if (isArray(value)) {
    return value.map((val) => SingleRedisStringToUTF8({ value: val }));
  }

  return value;
};

export const RedisStringToUTF8Transformer = (
  opts?: RedisStringTransformOptions,
) => {
  if (opts?.each) {
    return Transform(ArrayRedisStringToUTF8, opts);
  }

  return Transform(SingleRedisStringToUTF8, opts);
};
