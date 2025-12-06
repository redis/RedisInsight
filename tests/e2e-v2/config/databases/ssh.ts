import { getEnvNumber, getEnvOptional } from '../env';

/**
 * SSH tunnel configuration
 */
export const sshConfig = {
  redis: {
    host: getEnvOptional('REDIS_SSH_HOST'),
    port: getEnvOptional('REDIS_SSH_PORT') ? getEnvNumber('REDIS_SSH_PORT') : undefined,
  },
  tunnel: {
    host: getEnvOptional('SSH_HOST'),
    port: getEnvOptional('SSH_PORT') ? getEnvNumber('SSH_PORT') : undefined,
    username: getEnvOptional('SSH_USERNAME'),
    password: getEnvOptional('SSH_PASSWORD'),
  },
};
