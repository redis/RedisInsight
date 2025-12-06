import { getEnv } from './env';

/**
 * Application configuration
 */
export const appConfig = {
  baseUrl: getEnv('RI_BASE_URL', 'http://localhost:8080'),
  apiUrl: getEnv('RI_API_URL', 'http://localhost:5540'),
};
