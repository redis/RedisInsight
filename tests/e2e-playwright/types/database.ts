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
 * Configuration for adding a database with TLS
 */
export interface AddTlsDatabaseConfig extends AddDatabaseConfig {
  tls: TlsConfig;
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
