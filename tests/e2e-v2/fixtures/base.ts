import { test as base } from '@playwright/test';
import { DatabasesPage } from '../pages';
import { ApiHelper } from '../helpers/api';

type Fixtures = {
  databasesPage: DatabasesPage;
  apiHelper: ApiHelper;
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
});

export { expect } from '@playwright/test';
