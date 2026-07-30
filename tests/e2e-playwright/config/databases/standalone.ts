import { RedisConnectionConfig } from 'e2eSrc/types';
import { getEnv, getEnvNumber, getEnvOptional } from '../env';

/**
 * Standalone Redis configurations
 */
export const standaloneConfig: RedisConnectionConfig = {
  host: getEnv('OSS_STANDALONE_HOST', '127.0.0.1'),
  port: getEnvNumber('OSS_STANDALONE_PORT', 8100),
  // Optional credentials. The docker test environment is unauthenticated, so
  // these are undefined there. They exist for platforms that cannot run the
  // docker environment (e.g. Windows runners) and must point at a Redis that
  // requires auth.
  username: getEnvOptional('OSS_STANDALONE_USERNAME'),
  password: getEnvOptional('OSS_STANDALONE_PASSWORD'),
};

export const standaloneV5Config: RedisConnectionConfig = {
  host: getEnv('OSS_STANDALONE_V5_HOST', '127.0.0.1'),
  port: getEnvNumber('OSS_STANDALONE_V5_PORT', 8101),
};

export const standaloneV7Config: RedisConnectionConfig = {
  host: getEnv('OSS_STANDALONE_V7_HOST', '127.0.0.1'),
  port: getEnvNumber('OSS_STANDALONE_V7_PORT', 8108),
};

export const standaloneV8Config: RedisConnectionConfig = {
  host: getEnv('OSS_STANDALONE_V8_HOST', '127.0.0.1'),
  port: getEnvNumber('OSS_STANDALONE_V8_PORT', 8109),
};

export const standaloneV880Config: RedisConnectionConfig = {
  host: getEnv('OSS_STANDALONE_V8_8_0_HOST', '127.0.0.1'),
  port: getEnvNumber('OSS_STANDALONE_V8_8_0_PORT', 8110),
};

export const standaloneEmptyConfig: RedisConnectionConfig = {
  host: getEnv('OSS_STANDALONE_EMPTY_HOST', '127.0.0.1'),
  port: getEnvNumber('OSS_STANDALONE_EMPTY_PORT', 8105),
};

export const standaloneBigConfig: RedisConnectionConfig = {
  host: getEnv('OSS_STANDALONE_BIG_HOST', '127.0.0.1'),
  port: getEnvNumber('OSS_STANDALONE_BIG_PORT', 8103),
};
