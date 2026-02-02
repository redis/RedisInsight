import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import { redisConfig } from 'e2eSrc/config';
import { AddDatabaseConfig, ConnectionType } from 'e2eSrc/types';

/**
 * Test database name prefix - used by cleanup to identify test databases
 * IMPORTANT: All test database names MUST start with this prefix
 */
export const TEST_DB_PREFIX = 'test-';

/**
 * Standalone database configuration factory
 */
export const StandaloneConfigFactory = Factory.define<AddDatabaseConfig>(() => ({
  host: redisConfig.standalone.host,
  port: redisConfig.standalone.port,
  name: `${TEST_DB_PREFIX}standalone-${faker.string.alphanumeric(8)}`,
}));

/**
 * Standalone V7 database configuration factory
 */
export const StandaloneV7ConfigFactory = Factory.define<AddDatabaseConfig>(() => ({
  host: redisConfig.standaloneV7.host,
  port: redisConfig.standaloneV7.port,
  name: `${TEST_DB_PREFIX}standalone-v7-${faker.string.alphanumeric(8)}`,
}));

/**
 * Standalone V8 database configuration factory
 */
export const StandaloneV8ConfigFactory = Factory.define<AddDatabaseConfig>(() => ({
  host: redisConfig.standaloneV8.host,
  port: redisConfig.standaloneV8.port,
  name: `${TEST_DB_PREFIX}standalone-v8-${faker.string.alphanumeric(8)}`,
}));

/**
 * Cluster database configuration factory
 */
export const ClusterConfigFactory = Factory.define<AddDatabaseConfig>(() => ({
  host: redisConfig.cluster.host,
  port: redisConfig.cluster.port,
  name: `${TEST_DB_PREFIX}cluster-${faker.string.alphanumeric(8)}`,
}));

/**
 * Sentinel database configuration factory
 */
export const SentinelConfigFactory = Factory.define<AddDatabaseConfig & { masterName: string }>(() => ({
  host: redisConfig.sentinel.host,
  port: redisConfig.sentinel.port,
  password: redisConfig.sentinel.password,
  name: `${TEST_DB_PREFIX}sentinel-${faker.string.alphanumeric(8)}`,
  masterName: redisConfig.sentinel.masterName,
}));

/**
 * Database factories by connection type
 */
export const databaseFactories = {
  [ConnectionType.Standalone]: StandaloneConfigFactory,
  [ConnectionType.Cluster]: ClusterConfigFactory,
  [ConnectionType.Sentinel]: SentinelConfigFactory,
};
