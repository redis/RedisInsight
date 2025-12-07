import { TransformOptions } from 'class-transformer';

export const REDIS_STRING_ENCODING_QUERY_PARAM_NAME = 'encoding';

export enum RedisStringResponseEncoding {
  UTF8 = 'utf8',
  ASCII = 'ascii',
  Buffer = 'buffer',
}

export type RedisString = string | Buffer;

export interface RedisStringTransformOptions extends TransformOptions {
  each: boolean;
}
