import { isArray } from 'lodash';
import { getASCIISafeStringFromBuffer } from 'src/utils/cli-helper';
import { RedisStringTransformOptions } from 'src/common/constants';
import { Transform } from 'class-transformer';

const SingleRedisStringToASCII = ({ value }) => {
  if (value instanceof Buffer) {
    return getASCIISafeStringFromBuffer(value);
  }

  // todo: double check. probably no need to convert utf8 to ascii
  return value;
};

const ArrayRedisStringToASCII = ({ value }) => {
  if (isArray(value)) {
    return value.map((val) => SingleRedisStringToASCII({ value: val }));
  }

  return value;
};

export const RedisStringToASCIITransformer = (
  opts?: RedisStringTransformOptions,
) => {
  if (opts?.each === true) {
    return Transform(ArrayRedisStringToASCII, opts);
  }

  return Transform(SingleRedisStringToASCII, opts);
};
