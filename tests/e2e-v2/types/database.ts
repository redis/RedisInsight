/**
 * Database connection types
 */
export enum ConnectionType {
  Standalone = 'STANDALONE',
  Cluster = 'CLUSTER',
  Sentinel = 'SENTINEL',
}

/**
 * Base Redis connection configuration for tests
 */
export interface RedisConnectionConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  db?: number;
}

/**
 * Configuration for adding a database via UI
 */
export interface AddDatabaseConfig extends RedisConnectionConfig {
  name: string;
}

/**
 * SSH tunnel configuration
 */
export interface SshConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
  passphrase?: string;
}

/**
 * Sentinel-specific configuration
 */
export interface SentinelConfig extends RedisConnectionConfig {
  masterName: string;
}

/**
 * Database instance as returned from the API
 * Only includes fields we need for test assertions/operations
 */
export interface DatabaseInstance {
  id: string;
  host: string;
  port: number;
  name: string;
  connectionType?: ConnectionType;
  username?: string | null;
  password?: string | null;
  db?: number;
  tls?: boolean;
  ssh?: boolean;
}
