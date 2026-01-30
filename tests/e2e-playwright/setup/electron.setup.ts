import { test as setup } from '@playwright/test';

/**
 * Electron setup project
 *
 * Note: We skip health checks because the Electron app is launched
 * by Playwright fixtures AFTER setup runs.
 * The API won't be available until the Electron app starts.
 */
setup('electron setup', async () => {
  console.log('\n🚀 Running Electron global setup...');
  console.log('   ℹ️  Skipping health checks (app launches via fixtures)');
  console.log('✅ Electron global setup complete\n');
});

