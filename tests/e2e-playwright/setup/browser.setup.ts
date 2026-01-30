import { test as setup, request } from '@playwright/test';
import { appConfig } from '../config';
import { ApiHelper } from '../helpers/api';

/**
 * Browser setup project
 * - Verifies the application is running
 * - Cleans up any leftover test data
 */
setup('browser setup', async () => {
  console.log('\n🚀 Running browser global setup...');

  // Verify the application is running
  console.log(`   Checking app at ${appConfig.clientUrl}...`);
  const context = await request.newContext({
    baseURL: appConfig.clientUrl,
  });

  try {
    const response = await context.get('/', { timeout: 10000 });
    if (!response.ok()) {
      throw new Error(`Application returned status ${response.status()}`);
    }
    console.log('   ✅ Application is running');
  } catch (error) {
    console.error('   ❌ Application is not running!');
    console.error(`   Make sure RedisInsight is running at ${appConfig.clientUrl}`);
    throw new Error(`Application health check failed: ${error}`);
  } finally {
    await context.dispose();
  }

  // Use ApiHelper for API health check and cleanup
  const apiHelper = new ApiHelper({ apiUrl: appConfig.apiUrl });

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

  console.log('✅ Browser global setup complete\n');
});

