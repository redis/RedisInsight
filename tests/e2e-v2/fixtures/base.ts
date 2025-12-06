import { test as base } from '@playwright/test';
import { DatabasesPage, BrowserPage, WorkbenchPage, CliPanel, AnalyticsPage, PubSubPage, SettingsPage, NavigationPage } from '../pages';
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
};

export const test = base.extend<Fixtures>({
  databasesPage: async ({ page }, use) => {
    await use(new DatabasesPage(page));
  },

  // eslint-disable-next-line no-empty-pattern
  apiHelper: async ({}, use) => {
    const helper = new ApiHelper();
    await use(helper);
    await helper.dispose();
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
});

export { expect } from '@playwright/test';
