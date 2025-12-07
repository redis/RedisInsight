import { RedisString, RedisStringTransformOptions } from 'src/common/constants';
import { isArray, isObject, isString } from 'lodash';
import { getBufferFromSafeASCIIString } from 'src/utils/cli-helper';
import { Transform } from 'class-transformer';

const SingleToRedisStringTransformer = ({ value }): RedisString => {
  if (value?.type === 'Buffer') {
    if (isArray(value.data)) {
      return Buffer.from(value);
    }

    if (isObject(value.data)) {
      return Buffer.from(Object.values(value.data as object));
    }
  }

  if (isString(value)) {
    return getBufferFromSafeASCIIString(value);
  }

  return value;
};

const ArrayToRedisStringTransformer = ({ value }) => {
  if (isArray(value)) {
    return value.map((val) => SingleToRedisStringTransformer({ value: val }));
  }

  return value;
};

export const AnyToRedisStringTransformer = (
  opts?: RedisStringTransformOptions,
) => {
  if (opts?.each === true) {
    return Transform(ArrayToRedisStringTransformer, opts);
  }

  return Transform(SingleToRedisStringTransformer, opts);
};
