import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneEmptyConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance } from 'e2eSrc/types';

/**
 * Empty Redis instance (dedicated port, default 8105) — zero-key welcome / CTAs.
 */
test.describe('Browser > Key List View (empty database)', () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    const config = StandaloneEmptyConfigFactory.build({
      name: `test-key-list-empty-${Date.now().toString(36)}`,
    });
    database = await apiHelper.createDatabase(config);
  });

  test.afterAll(async ({ apiHelper }) => {
    if (database?.id) {
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test('should show empty database welcome and open Add key from message', async ({ browserPage }) => {
    await browserPage.goto(database.id);
    await browserPage.keyList.switchToListView();

    await expect(browserPage.keyList.emptyDatabasePanel).toBeVisible();
    await expect(browserPage.page.getByText(/Let's start working/i)).toBeVisible();

    await browserPage.keyList.addKeyFromEmptyButton.click();
    await expect(browserPage.addKeyDialog.title).toBeVisible();
    await browserPage.closeAddKeyDialog();
  });
});
