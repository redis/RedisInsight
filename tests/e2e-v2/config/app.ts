import { getEnv, getEnvOptional } from './env';

/**
 * Whether tests are running in Electron mode
 */
export const isElectron = !!getEnvOptional('ELECTRON_EXECUTABLE_PATH');

/**
 * Application configuration
 *
 * When running in Electron mode:
 * - The Electron app has its own internal API server on port 5530 (by default)
 * - We need to use that port for API calls, not 5540 (browser dev server)
 */
export const appConfig = {
  baseUrl: getEnv('RI_BASE_URL', 'http://localhost:8080'),
  // In Electron mode, use port 5530 (Electron's internal API); in browser mode, use 5540 (dev server)
  apiUrl: getEnv('RI_API_URL', isElectron ? 'http://localhost:5530' : 'http://localhost:5540'),

  /**
   * Electron executable path for desktop testing
   * When set, tests will run against Electron app instead of browser
   *
   * Example paths:
   * - macOS arm64: release/mac-arm64/Redis Insight.app/Contents/MacOS/Redis Insight
   * - macOS x64: release/mac-x64/Redis Insight.app/Contents/MacOS/Redis Insight
   * - Linux: release/linux-unpacked/redisinsight
   * - Windows: release/win-unpacked/Redis Insight.exe
   */
  electronExecutablePath: getEnvOptional('ELECTRON_EXECUTABLE_PATH'),
};
