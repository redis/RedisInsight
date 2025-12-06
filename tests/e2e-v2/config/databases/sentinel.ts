import { getEnv, getEnvNumber } from '../env';

/**
 * Sentinel Redis configuration
 */
export const sentinelConfig = {
  host: getEnv('OSS_SENTINEL_HOST', '127.0.0.1'),
  port: getEnvNumber('OSS_SENTINEL_PORT', 28100),
  password: getEnv('OSS_SENTINEL_PASSWORD', 'password'),
  masterName: getEnv('OSS_SENTINEL_MASTER_NAME', 'primary-group-1'),
};
