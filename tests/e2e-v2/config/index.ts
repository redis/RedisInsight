/**
 * Central configuration exports
 *
 * Structure:
 * - config/app.ts        - Application URLs
 * - config/env.ts        - Environment variable helpers
 * - config/tags.ts       - Test tags for filtering
 * - config/databases/    - Database configs by type (standalone, cluster, sentinel, ssh)
 */

// App configuration
export { appConfig, isElectron } from './app';

// Database configurations
export * from './databases';

// Test tags
export { Tags, tagged } from './tags';
export type { TestTag } from './tags';

// Environment helpers (for custom configs)
export { getEnv, getEnvNumber, getEnvOptional, currentEnv } from './env';
