import { test as base } from '@playwright/test';
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

type Fixtures = {
  databasesPage: DatabasesPage;
  apiHelper: ApiHelper;
  /**
   * Browser page fixture - requires databaseId to be set
   * Use createBrowserPage for dynamic database IDs
   */
  createBrowserPage: (databaseId: string) => BrowserPage;
  /**
   * Workbench page fixture - requires databaseId to be set
   * Use createWorkbenchPage for dynamic database IDs
   */
  createWorkbenchPage: (databaseId: string) => WorkbenchPage;
  /**
   * CLI panel fixture - shared across pages
   */
  cliPanel: CliPanel;
  /**
   * Analytics page fixture - requires databaseId to be set
   * Use createAnalyticsPage for dynamic database IDs
   */
  createAnalyticsPage: () => AnalyticsPage;
  /**
   * Pub/Sub page fixture - requires databaseId to be set
   * Use createPubSubPage for dynamic database IDs
   */
  createPubSubPage: () => PubSubPage;
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

export const test = base.extend<Fixtures>({
  // Ensure EULA is accepted before each test (via API)
  // This runs automatically for all tests using the apiHelper fixture
  // eslint-disable-next-line no-empty-pattern
  apiHelper: async ({}, use) => {
    const helper = new ApiHelper();
    // Ensure EULA is accepted so tests don't get blocked by popup
    await helper.ensureEulaAccepted();
    await use(helper);
    await helper.dispose();
  },

  databasesPage: async ({ page }, use) => {
    await use(new DatabasesPage(page));
  },

  createBrowserPage: async ({ page }, use) => {
    await use((databaseId: string) => new BrowserPage(page, databaseId));
  },

  createWorkbenchPage: async ({ page }, use) => {
    // databaseId is used for navigation context but WorkbenchPage doesn't need it directly
    await use((_databaseId: string) => new WorkbenchPage(page));
  },

  cliPanel: async ({ page }, use) => {
    await use(new CliPanel(page));
  },

  createAnalyticsPage: async ({ page }, use) => {
    await use(() => new AnalyticsPage(page));
  },

  createPubSubPage: async ({ page }, use) => {
    await use(() => new PubSubPage(page));
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

export { expect } from '@playwright/test';
