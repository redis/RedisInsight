import { RedisConnectionConfig, SshTunnelConfig } from 'e2eSrc/types';
import { getEnvNumber, getEnvOptional } from '../env';

/**
 * Redis configuration for SSH connection
 */
export const sshRedisConfig: Partial<RedisConnectionConfig> = {
  host: getEnvOptional('REDIS_SSH_HOST'),
  port: getEnvOptional('REDIS_SSH_PORT') ? getEnvNumber('REDIS_SSH_PORT') : undefined,
};

/**
 * SSH tunnel configuration
 */
export const sshTunnelConfig: SshTunnelConfig = {
  host: getEnvOptional('SSH_HOST'),
  port: getEnvOptional('SSH_PORT') ? getEnvNumber('SSH_PORT') : undefined,
  username: getEnvOptional('SSH_USERNAME'),
  password: getEnvOptional('SSH_PASSWORD'),
};
