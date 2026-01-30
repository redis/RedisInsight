/**
 * Central configuration exports
 *
 * Structure:
 * - config/app.ts        - Application URLs
 * - config/env.ts        - Environment variable helpers
 * - config/databases/    - Database configs by type (standalone, cluster, sentinel, ssh)
 */

// App configuration
export { appConfig } from './app';

// Database configurations
export * from './databases';

// Environment helpers (for custom configs)
export { getEnv, getEnvNumber, getEnvOptional, currentEnv } from './env';
