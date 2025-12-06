import { ApiHelper } from './helpers/api';

/**
 * Global teardown runs after all tests
 * - Cleans up test data created during tests
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

  console.log('✅ Global teardown complete\n');
}

export default globalTeardown;
