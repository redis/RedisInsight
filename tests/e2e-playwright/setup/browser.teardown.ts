import { test as teardown } from '@playwright/test';
import { appConfig } from 'e2eSrc/config';
import { ApiHelper } from '../helpers';

/**
 * Browser teardown project
 * - Cleans up test data created during tests
 */
teardown('browser teardown', async () => {
  console.log('\n🧹 Running browser global teardown...');

  const apiHelper = new ApiHelper({ apiUrl: appConfig.apiUrl });

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

  console.log('✅ Browser global teardown complete\n');
});

