import { RedisConnectionConfig } from 'e2eSrc/types';
import { getEnv, getEnvNumber } from '../env';

/**
 * Cluster Redis configuration (IP-based, uses cluster-announce-ip)
 */
export const clusterConfig: RedisConnectionConfig = {
  host: getEnv('OSS_CLUSTER_HOST', '127.0.0.1'),
  port: getEnvNumber('OSS_CLUSTER_PORT', 8200),
};

/**
 * Cluster Redis configuration with cluster-announce-hostname enabled.
 * Nodes advertise hostnames instead of IPs in CLUSTER SHARDS responses.
 */
export const clusterHostnameConfig: RedisConnectionConfig = {
  host: getEnv('OSS_CLUSTER_HOSTNAME_HOST', '127.0.0.1'),
  port: getEnvNumber('OSS_CLUSTER_HOSTNAME_PORT', 8210),
};
