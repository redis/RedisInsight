import { isArray } from 'lodash';
import { RedisStringTransformOptions } from 'src/common/constants';
import { Transform } from 'class-transformer';

const SingleRedisStringToBuffer = ({ value }) => {
  if (value instanceof Buffer) {
    return value;
  }

  return Buffer.from(value);
};

const ArrayRedisStringToBuffer = ({ value }) => {
  if (isArray(value)) {
    return value.map((val) => SingleRedisStringToBuffer({ value: val }));
  }

  return Buffer.from(value);
};

export const RedisStringToBufferTransformer = (
  opts?: RedisStringTransformOptions,
) => {
  if (opts?.each === true) {
    return Transform(ArrayRedisStringToBuffer, opts);
  }
  return Transform(SingleRedisStringToBuffer, opts);
};
