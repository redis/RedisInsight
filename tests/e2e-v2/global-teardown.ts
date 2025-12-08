import { ApiHelper, formatDuration } from './helpers';
import './types/global';

/**
 * Global teardown runs after all tests
 * - Cleans up test data created during tests
 * - Reports total test duration
 */
async function globalTeardown(): Promise<void> {
  console.log('\n🧹 Running global teardown...');

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

  // Calculate and display total duration
  if (globalThis.__TEST_START_TIME__) {
    const duration = Date.now() - globalThis.__TEST_START_TIME__;
    console.log(`\n⏱️  Total test duration: ${formatDuration(duration)}`);
  }

  console.log('✅ Global teardown complete\n');
}

export default globalTeardown;
