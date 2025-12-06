import { test as base } from '@playwright/test';
import { DatabasesPage, BrowserPage } from '../pages';
import { ApiHelper } from '../helpers/api';

type Fixtures = {
  databasesPage: DatabasesPage;
  apiHelper: ApiHelper;
  /**
   * Browser page fixture - requires databaseId to be set
   * Use createBrowserPage for dynamic database IDs
   */
  createBrowserPage: (databaseId: string) => BrowserPage;
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
});

export { expect } from '@playwright/test';
