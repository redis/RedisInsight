import {
  test as base,
  ElectronApplication,
  Page,
  _electron as electron,
} from '@playwright/test';
import {
  DatabasesPage,
  BrowserPage,
  WorkbenchPage,
  CliPanel,
  AnalyticsPage,
  PubSubPage,
  SettingsPage,
  NavigationPage,
  EulaPage,
} from '../pages';
import { ApiHelper } from '../helpers/api';
import { appConfig, isElectron } from '../config';

type ElectronFixtures = {
  electronApp: ElectronApplication;
  page: Page;
};

type Fixtures = {
  databasesPage: DatabasesPage;
  apiHelper: ApiHelper;
  /**
   * Browser page fixture
   * Use browserPage.goto(databaseId) to navigate
   */
  browserPage: BrowserPage;
  /**
   * Workbench page fixture
   * Use workbenchPage.goto(databaseId) to navigate
   */
  workbenchPage: WorkbenchPage;
  /**
   * CLI panel fixture - shared across pages
   */
  cliPanel: CliPanel;
  /**
   * Analytics page fixture
   * Use analyticsPage.goto(databaseId) to navigate
   */
  analyticsPage: AnalyticsPage;
  /**
   * Pub/Sub page fixture
   * Use pubSubPage.goto(databaseId) to navigate
   */
  pubSubPage: PubSubPage;
  /**
   * Settings page fixture
   */
  settingsPage: SettingsPage;
  /**
   * Navigation page fixture
   */
  navigationPage: NavigationPage;
  /**
   * EULA page fixture - for testing EULA/consent popup
   * Note: Most tests should use apiHelper.ensureEulaAccepted() instead
   */
  eulaPage: EulaPage;
};

// TODO: check old playwright fixture
/**
 * Browser-based test fixtures (default)
 */
const browserTest = base.extend<Fixtures>({
  // Ensure EULA is accepted before each test (via API)
  // This runs automatically for all tests using the apiHelper fixture
  // eslint-disable-next-line no-empty-pattern
  apiHelper: async ({}, use) => {
    const helper = new ApiHelper();
    // In browser mode, ensure EULA is accepted via API before tests
    // In Electron mode, this is handled separately after the app launches
    if (!isElectron) {
      await helper.ensureEulaAccepted();
    }
    await use(helper);
    await helper.dispose();
  },

  databasesPage: async ({ page }, use) => {
    await use(new DatabasesPage(page));
  },

  browserPage: async ({ page }, use) => {
    await use(new BrowserPage(page));
  },

  workbenchPage: async ({ page }, use) => {
    await use(new WorkbenchPage(page));
  },

  cliPanel: async ({ page }, use) => {
    await use(new CliPanel(page));
  },

  analyticsPage: async ({ page }, use) => {
    await use(new AnalyticsPage(page));
  },

  pubSubPage: async ({ page }, use) => {
    await use(new PubSubPage(page));
  },

  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },

  navigationPage: async ({ page }, use) => {
    await use(new NavigationPage(page));
  },

  eulaPage: async ({ page }, use) => {
    await use(new EulaPage(page));
  },
});

/**
 * Electron-based test fixtures for desktop app testing
 *
 * Important: In Electron mode, the apiHelper depends on page (which depends on
 * electronApp) to ensure the app is running before any API calls are made.
 */
const electronTest = browserTest.extend<ElectronFixtures>({
  // Electron app - launched per test
  // eslint-disable-next-line no-empty-pattern
  electronApp: async ({}, use) => {
    if (!appConfig.electronExecutablePath) {
      throw new Error(
        'ELECTRON_EXECUTABLE_PATH environment variable is required for Electron tests',
      );
    }

    console.log(
      `Launching Electron app: ${appConfig.electronExecutablePath}`,
    );

    const electronApp = await electron.launch({
      executablePath: appConfig.electronExecutablePath,
      args: ['--no-sandbox'],
      timeout: 60000,
    });

    // Log Electron console messages for debugging
    electronApp.on('console', (msg) => {
      console.log(`[Electron] ${msg.type()}: ${msg.text()}`);
    });

    // Wait for app to fully initialize and API to be ready
    console.log('Waiting for Electron app to initialize...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Wait for API to be available (Electron starts its own API server)
    const apiHelper = new ApiHelper();
    let apiReady = false;
    for (let i = 0; i < 30; i++) {
      try {
        await apiHelper.getDatabases();
        apiReady = true;
        console.log('Electron API is ready');
        break;
      } catch {
        console.log(`Waiting for Electron API... (attempt ${i + 1}/30)`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    await apiHelper.dispose();

    if (!apiReady) {
      throw new Error('Electron API did not become available within 30 seconds');
    }

    await use(electronApp);

    console.log('Closing Electron app...');
    await electronApp.close();
  },

  // Page from Electron app
  page: async ({ electronApp }, use) => {
    const electronPage = await electronApp.firstWindow();

    // Wait for the app to be ready
    await electronPage.waitForLoadState('domcontentloaded');

    // Small delay for UI to stabilize
    await new Promise((resolve) => setTimeout(resolve, 500));

    await use(electronPage);
  },

  // Override apiHelper to ensure EULA is accepted after Electron app is running
  // The page dependency ensures electronApp is launched first
  apiHelper: async ({ page }, use) => {
    // page dependency ensures the Electron app is running before we use the API
    void page; // Ensure dependency is used

    const helper = new ApiHelper();
    // Ensure EULA is accepted
    await helper.ensureEulaAccepted();
    await use(helper);
    await helper.dispose();
  },
});

/**
 * Test fixture that automatically selects browser or Electron mode
 * based on ELECTRON_EXECUTABLE_PATH environment variable
 */
export const test = isElectron ? electronTest : browserTest;

export { expect } from '@playwright/test';
export { isElectron };
