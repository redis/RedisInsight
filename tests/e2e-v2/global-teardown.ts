import { isElectron } from './config';
import { ApiHelper, formatDuration } from './helpers';
import './types/global';

/**
 * Global teardown runs after all tests
 * - Cleans up test data created during tests
 * - Reports total test duration
 *
 * Note: In Electron mode, we skip cleanup because the Electron app
 * (with its internal API) has already been closed by fixtures.
 */
async function globalTeardown(): Promise<void> {
  console.log('\n🧹 Running global teardown...');

  // TODO: unify for both web and electron
  // In Electron mode, skip API cleanup - the app is already closed
  // Each test is responsible for cleaning up after itself
  if (isElectron) {
    console.log('   ℹ️  Electron mode: skipping API cleanup (app already closed)');
  } else {
    const apiHelper = new ApiHelper();

    try {
      const deletedCount = await apiHelper.deleteTestDatabases();

      if (deletedCount > 0) {
        console.log(`   ✅ Cleaned up ${deletedCount} test database(s)`);
      } else {
        console.log('   ✅ No test databases to clean up');
      }
    } catch (error) {
      console.warn('   ⚠️ Could not clean up test databases:', error);
    } finally {
      await apiHelper.dispose();
    }
  }

  // Calculate and display total duration
  if (globalThis.__TEST_START_TIME__) {
    const duration = Date.now() - globalThis.__TEST_START_TIME__;
    console.log(`\n⏱️  Total test duration: ${formatDuration(duration)}`);
  }

  console.log('✅ Global teardown complete\n');
}

export default globalTeardown;
