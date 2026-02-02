import { RedisConnectionConfig } from 'e2eSrc/types';
import { getEnv, getEnvNumber } from '../env';

/**
 * Cluster Redis configuration
 */
export const clusterConfig: RedisConnectionConfig = {
  host: getEnv('OSS_CLUSTER_HOST', '127.0.0.1'),
  port: getEnvNumber('OSS_CLUSTER_PORT', 8200),
};
