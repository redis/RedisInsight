import { faker } from '@faker-js/faker';
import { redisConfig } from '../../config';
import { AddDatabaseConfig, ConnectionType } from '../../types';

/**
 * Test database name prefix - used by cleanup to identify test databases
 * IMPORTANT: All test database names MUST start with this prefix
 */
export const TEST_DB_PREFIX = 'test-';

/**
 * Generate a unique database name for tests
 * Always prefixed with 'test-' to ensure cleanup works
 */
export function generateDatabaseName(suffix?: string): string {
  const uniqueId = faker.string.alphanumeric(8);
  return suffix ? `${TEST_DB_PREFIX}${suffix}-${uniqueId}` : `${TEST_DB_PREFIX}${uniqueId}`;
}

/**
 * Get standalone database configuration
 */
export function getStandaloneConfig(overrides?: Partial<AddDatabaseConfig>): AddDatabaseConfig {
  return {
    host: redisConfig.standalone.host,
    port: redisConfig.standalone.port,
    name: generateDatabaseName('standalone'),
    ...overrides,
  };
}

/**
 * Get standalone V7 database configuration
 */
export function getStandaloneV7Config(overrides?: Partial<AddDatabaseConfig>): AddDatabaseConfig {
  return {
    host: redisConfig.standaloneV7.host,
    port: redisConfig.standaloneV7.port,
    name: generateDatabaseName('standalone-v7'),
    ...overrides,
  };
}

/**
 * Get standalone V8 database configuration
 */
export function getStandaloneV8Config(overrides?: Partial<AddDatabaseConfig>): AddDatabaseConfig {
  return {
    host: redisConfig.standaloneV8.host,
    port: redisConfig.standaloneV8.port,
    name: generateDatabaseName('standalone-v8'),
    ...overrides,
  };
}

/**
 * Get cluster database configuration
 */
export function getClusterConfig(overrides?: Partial<AddDatabaseConfig>): AddDatabaseConfig {
  return {
    host: redisConfig.cluster.host,
    port: redisConfig.cluster.port,
    name: generateDatabaseName('cluster'),
    ...overrides,
  };
}

/**
 * Get sentinel database configuration
 */
export function getSentinelConfig(overrides?: Partial<AddDatabaseConfig>): AddDatabaseConfig & { masterName: string } {
  return {
    host: redisConfig.sentinel.host,
    port: redisConfig.sentinel.port,
    password: redisConfig.sentinel.password,
    name: generateDatabaseName('sentinel'),
    masterName: redisConfig.sentinel.masterName,
    ...overrides,
  };
}

/**
 * Database configurations by connection type
 */
export const databaseConfigs = {
  [ConnectionType.Standalone]: getStandaloneConfig,
  [ConnectionType.Cluster]: getClusterConfig,
  [ConnectionType.Sentinel]: getSentinelConfig,
};

/**
 * Get database configuration by connection type
 */
export function getDatabaseConfig(
  connectionType: ConnectionType,
  overrides?: Partial<AddDatabaseConfig>,
): AddDatabaseConfig {
  const configFn = databaseConfigs[connectionType];
  if (!configFn) {
    throw new Error(`No configuration found for connection type: ${connectionType}`);
  }
  return configFn(overrides);
}
