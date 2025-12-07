import { applyDecorators } from '@nestjs/common';
import {
  AnyToRedisString,
  RedisStringToASCII,
  RedisStringToBuffer,
  RedisStringToUTF8,
} from 'src/common/decorators';
import {
  RedisStringResponseEncoding,
  RedisStringTransformOptions,
} from 'src/common/constants';

export function RedisStringType(opts?: RedisStringTransformOptions) {
  return applyDecorators(
    RedisStringToASCII({
      groups: [RedisStringResponseEncoding.ASCII],
      toPlainOnly: true,
      ...opts,
    }),
    RedisStringToUTF8({
      groups: [RedisStringResponseEncoding.UTF8],
      toPlainOnly: true,
      ...opts,
    }),
    RedisStringToBuffer({
      groups: [RedisStringResponseEncoding.Buffer],
      toPlainOnly: true,
      ...opts,
    }),
    AnyToRedisString({
      toClassOnly: true,
      ...opts,
    }),
  );
}
