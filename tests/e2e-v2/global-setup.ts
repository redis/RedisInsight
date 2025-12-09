import { request } from '@playwright/test';
import { appConfig, isElectron } from './config';
import { ApiHelper } from './helpers/api';
import './types/global';

/**
 * Global setup runs before all tests
 * - Verifies the application is running (browser mode only)
 * - Cleans up any leftover test data
 *
 * Note: In Electron mode, we skip health checks because the Electron app
 * is launched by Playwright fixtures AFTER global setup runs.
 * The API won't be available until the Electron app starts.
 */
async function globalSetup(): Promise<void> {
  // Record start time for duration tracking
  globalThis.__TEST_START_TIME__ = Date.now();

  console.log('\n🚀 Running global setup...');

  // TODO: unify for both web and electron
  // In Electron mode, skip health checks - the app isn't running yet
  // The Electron app (with its internal API) is launched by fixtures
  if (isElectron) {
    console.log('   ℹ️  Electron mode: skipping health checks (app launches via fixtures)');
    console.log('✅ Global setup complete\n');
    return;
  }

  // Browser mode: Verify the application is running
  console.log(`   Checking app at ${appConfig.baseUrl}...`);
  const context = await request.newContext({
    baseURL: appConfig.baseUrl,
  });

  try {
    const response = await context.get('/', { timeout: 10000 });
    if (!response.ok()) {
      throw new Error(`Application returned status ${response.status()}`);
    }
    console.log('   ✅ Application is running');
  } catch (error) {
    console.error('   ❌ Application is not running!');
    console.error(`   Make sure RedisInsight is running at ${appConfig.baseUrl}`);
    throw new Error(`Application health check failed: ${error}`);
  } finally {
    await context.dispose();
  }

  // Use ApiHelper for API health check and cleanup
  const apiHelper = new ApiHelper();

  try {
    // Verify API is running by fetching databases
    console.log(`   Checking API at ${appConfig.apiUrl}...`);
    await apiHelper.getDatabases();
    console.log('   ✅ API is running');

    // Clean up test databases from previous runs
    console.log('   Cleaning up test databases from previous runs...');
    const deletedCount = await apiHelper.deleteTestDatabases();

    if (deletedCount > 0) {
      console.log(`   ✅ Cleaned up ${deletedCount} test database(s)`);
    } else {
      console.log('   ✅ No test databases to clean up');
    }
  } catch (error) {
    console.error('   ❌ API is not running or cleanup failed!');
    console.error(`   Make sure RedisInsight API is running at ${appConfig.apiUrl}`);
    throw new Error(`API health check failed: ${error}`);
  } finally {
    await apiHelper.dispose();
  }

  console.log('✅ Global setup complete\n');
}

export default globalSetup;
