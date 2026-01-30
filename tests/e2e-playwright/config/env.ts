import * as dotenv from 'dotenv';
import * as path from 'path';

/**
 * Environment configuration loader
 *
 * Supports multiple environments via ENV variable:
 *   ENV=staging npm test   → loads .env.staging
 *   ENV=ci npm test        → loads .env.ci
 *   npm test               → loads .env (default/local)
 *
 * Priority: process.env > .env.{ENV} > .env
 */

const env = process.env.ENV || 'local';
const envFile = env === 'local' ? '.env' : `.env.${env}`;
const envPath = path.resolve(__dirname, '..', envFile);

// Load environment-specific file first
dotenv.config({ path: envPath });

// Load default .env as fallback (won't override existing values)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Export current environment name
export const currentEnv = env;

/**
 * Get environment variable with optional default value
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get environment variable as number
 */
export function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return defaultValue;
  }
  const num = parseInt(value, 10);
  if (isNaN(num)) {
    throw new Error(`Environment variable ${key} must be a number, got: ${value}`);
  }
  return num;
}

/**
 * Get optional environment variable
 */
export function getEnvOptional(key: string): string | undefined {
  return process.env[key];
}
