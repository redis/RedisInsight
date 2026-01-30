import { getEnv } from './env';

/**
 * Application configuration
 */
export const appConfig = {
  clientUrl: getEnv('RI_CLIENT_URL', 'http://localhost:8080'),
  apiUrl: getEnv('RI_API_URL', 'http://localhost:5540'),
  electronApiUrl: getEnv('RI_ELECTRON_API_URL', 'http://localhost:5530'),
  electronExecutablePath: getEnv('ELECTRON_EXECUTABLE_PATH', ''),
};
