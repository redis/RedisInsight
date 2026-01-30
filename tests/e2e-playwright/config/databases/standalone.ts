import { getEnv, getEnvNumber } from '../env';

/**
 * Standalone Redis configurations
 */
export const standaloneConfig = {
  host: getEnv('OSS_STANDALONE_HOST', '127.0.0.1'),
  port: getEnvNumber('OSS_STANDALONE_PORT', 8100),
};

export const standaloneV5Config = {
  host: getEnv('OSS_STANDALONE_V5_HOST', '127.0.0.1'),
  port: getEnvNumber('OSS_STANDALONE_V5_PORT', 8101),
};

export const standaloneV7Config = {
  host: getEnv('OSS_STANDALONE_V7_HOST', '127.0.0.1'),
  port: getEnvNumber('OSS_STANDALONE_V7_PORT', 8108),
};

export const standaloneV8Config = {
  host: getEnv('OSS_STANDALONE_V8_HOST', '127.0.0.1'),
  port: getEnvNumber('OSS_STANDALONE_V8_PORT', 8109),
};

export const standaloneEmptyConfig = {
  host: getEnv('OSS_STANDALONE_EMPTY_HOST', '127.0.0.1'),
  port: getEnvNumber('OSS_STANDALONE_EMPTY_PORT', 8105),
};

export const standaloneBigConfig = {
  host: getEnv('OSS_STANDALONE_BIG_HOST', '127.0.0.1'),
  port: getEnvNumber('OSS_STANDALONE_BIG_PORT', 8103),
};
