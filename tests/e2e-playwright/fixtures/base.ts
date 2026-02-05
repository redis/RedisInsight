import { test as base, ElectronApplication, _electron as electron } from '@playwright/test';
import { BrowserPage, CliPanel } from 'e2eSrc/pages';
import { ApiHelper, retry } from 'e2eSrc/helpers';

/**
 * Test-scoped fixtures
 */
type Fixtures = {
  apiHelper: ApiHelper;
  /**
   * Browser page fixture
   * Use browserPage.goto(databaseId) to navigate
   */
  browserPage: BrowserPage;
  cliPanel: CliPanel;
};

/**
 * Worker-scoped fixtures and options (shared across all tests in a worker)
 */
type WorkerFixtures = {
  /** Path to Electron executable - when set, tests run in Electron mode */
  electronExecutablePath: string | undefined;
  apiUrl: string;
  electronApp: ElectronApplication | undefined;
};

/**
 * Base test with custom options and common fixtures
 */
const baseTest = base.extend<Fixtures, WorkerFixtures>({
  // Custom options - can be set per-project in playwright.config.ts
  // Worker-scoped so they're available to worker-scoped fixtures
  electronExecutablePath: [undefined, { option: true, scope: 'worker' }],
  apiUrl: ['', { option: true, scope: 'worker' }],

  // Electron app - worker-scoped, shared across all tests in a worker
  // Only launched when electronExecutablePath is set
  electronApp: [
    async ({ electronExecutablePath, apiUrl }, use) => {
      if (!electronExecutablePath) {
        // Browser mode - no Electron app needed
        await use(undefined);
        return;
      }

      console.log(`Launching Electron app: ${electronExecutablePath}`);

      const electronApp = await electron.launch({
        executablePath: electronExecutablePath,
        args: ['--no-sandbox'],
        timeout: 60000,
      });

      // Log Electron console messages for debugging
      electronApp.on('console', (msg) => {
        console.log(`[Electron] ${msg.type()}: ${msg.text()}`);
      });

      // Wait for app to fully initialize and API to be ready
      console.log('Waiting for Electron app to initialize...');
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Wait for API to be available with more retries for CI environments
      const apiHelper = new ApiHelper({ apiUrl });
      const checkApi = async () => {
        console.log(`Checking API at ${apiUrl}...`);
        await apiHelper.getDatabases();
        console.log('Electron API is ready');
      };
      await retry(checkApi, {
        maxAttempts: 5,
        delayMs: 2000,
        errorMessage: 'Electron API did not become available',
      });
      await apiHelper.dispose();

      await use(electronApp);

      console.log('Closing Electron app...');
      await electronApp.close();
    },
    { scope: 'worker' },
  ],

  // Page - from Electron app or browser depending on mode
  page: async ({ electronApp, page, baseURL }, use) => {
    if (!electronApp) {
      // Browser mode - navigate to app if on blank page
      if (page.url() === 'about:blank' && baseURL) {
        await page.goto(baseURL);
        await page.waitForLoadState('domcontentloaded');
      }
      await use(page);
      return;
    }

    // Electron mode - get page from Electron app
    const electronPage = await electronApp.firstWindow();
    // Reload to pick up any data created in beforeAll (e.g., databases via API)
    await electronPage.reload();
    await electronPage.waitForLoadState('domcontentloaded');

    await use(electronPage);
  },

  apiHelper: async ({ apiUrl, electronApp }, use) => {
    void electronApp; // Ensure Electron app is ready before making API calls

    const helper = new ApiHelper({ apiUrl });
    await helper.ensureEulaAccepted();
    await use(helper);
    await helper.dispose();
  },

  browserPage: async ({ page }, use) => {
    await use(new BrowserPage(page));
  },

  cliPanel: async ({ page }, use) => {
    await use(new CliPanel(page));
  },
});

export const test = baseTest;
export { expect } from '@playwright/test';
