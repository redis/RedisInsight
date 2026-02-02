/**
 * Database configurations - organized by connection type
 * Add new database configs in separate files and re-export here
 */

import {
  standaloneConfig,
  standaloneV5Config,
  standaloneV7Config,
  standaloneV8Config,
  standaloneEmptyConfig,
  standaloneBigConfig,
} from './standalone';

import { clusterConfig } from './cluster';

import { sentinelConfig } from './sentinel';

import { sshRedisConfig, sshTunnelConfig } from './ssh';

export const redisConfig = {
  standalone: standaloneConfig,
  standaloneV5: standaloneV5Config,
  standaloneV7: standaloneV7Config,
  standaloneV8: standaloneV8Config,
  standaloneEmpty: standaloneEmptyConfig,
  standaloneBig: standaloneBigConfig,
  cluster: clusterConfig,
  sentinel: sentinelConfig,
  sshRedis: sshRedisConfig,
  sshTunnel: sshTunnelConfig,
};
