import { test as teardown } from '@playwright/test';

/**
 * Electron teardown project
 *
 * Note: We skip API cleanup because the Electron app
 * (with its internal API) has already been closed by fixtures.
 * Each test is responsible for cleaning up after itself.
 */
teardown('electron teardown', async () => {
  console.log('\n🧹 Running Electron global teardown...');
  console.log('   ℹ️  Skipping API cleanup (app already closed)');
  console.log('✅ Electron global teardown complete\n');
});
