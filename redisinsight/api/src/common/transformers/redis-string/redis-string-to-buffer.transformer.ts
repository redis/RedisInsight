import { isArray } from 'lodash';
import { RedisStringTransformOptions } from 'src/common/constants';
import { Transform } from 'class-transformer';

const SingleRedisStringToBuffer = ({ value }) => {
  if (value instanceof Buffer) {
    return value;
  }

  // Preserve null/undefined so callers can express "absent" entries (e.g.
  // ARGETRANGE returns null for empty slots in a gap-preserving response).
  // Mirrors the behaviour of the sibling ASCII / UTF8 transformers, which
  // also short-circuit on non-Buffer values rather than throwing.
  if (value === null || value === undefined) {
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
