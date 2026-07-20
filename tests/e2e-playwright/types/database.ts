/**
 * Database connection types
 */
export enum ConnectionType {
  Standalone = 'STANDALONE',
  StandaloneBig = 'STANDALONE_BIG',
  Cluster = 'CLUSTER',
  Sentinel = 'SENTINEL',
}

/**
 * Per-database environment classification (prod vs non-prod modes).
 * Mirrors the `Environment` enum exposed by the API.
 */
export enum Environment {
  Unspecified = 'unspecified',
  Production = 'production',
  Development = 'development',
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
  environment?: Environment;
}

/**
 * Cloud (Redis Cloud) subscription metadata that marks a database as managed.
 * When present on a created database, the app treats its endpoint as owned by
 * the cloud provider and keeps host/port read-only.
 */
export interface CloudDatabaseDetailsConfig {
  cloudId: number;
  subscriptionType: 'fixed' | 'flexible';
}

/**
 * Configuration for adding a database via UI
 */
export interface AddDatabaseConfig extends RedisConnectionConfig {
  name: string;
  cloudDetails?: CloudDatabaseDetailsConfig;
}

/**
 * SSH tunnel configuration
 */
export interface SshTunnelConfig {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  privateKey?: string;
  passphrase?: string;
}

/**
 * TLS certificate configuration
 */
export interface TlsCertConfig {
  name: string;
  certificate: string;
}

/**
 * TLS client certificate configuration (includes private key)
 */
export interface TlsClientCertConfig extends TlsCertConfig {
  key: string;
}

/**
 * TLS configuration for database connection
 */
export interface TlsConfig {
  enabled: boolean;
  verifyServerCert?: boolean;
  useSni?: boolean;
  sniHost?: string;
  caCert?: TlsCertConfig;
  clientCert?: TlsClientCertConfig;
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
