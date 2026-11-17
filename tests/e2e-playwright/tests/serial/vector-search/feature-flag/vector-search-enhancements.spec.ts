import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneEmptyConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance } from 'e2eSrc/types';

test.describe('Vector Search > vectorSearchEnhancements flag', () => {
  let database: DatabaseInstance;

  test.afterEach(async ({ apiHelper }) => {
    await apiHelper.deleteDatabase(database.id);
  });

  test.describe('when the flag is on', () => {
    test.use({ featureFlags: { vectorSearchEnhancements: true } });

    test('shows the enhanced "Create index" entry, always enabled', async ({ vectorSearchPage, apiHelper }) => {
      database = await apiHelper.createDatabase(StandaloneEmptyConfigFactory.build());
      await apiHelper.sendCommand(database.id, 'FLUSHDB');
      await apiHelper.deleteAllIndexes(database.id);

      await vectorSearchPage.goto(database.id);
      await expect(vectorSearchPage.welcomeWrapper).toBeVisible();

      const button = vectorSearchPage.welcomeScreen.useMyDatabaseButton;
      await expect(button).toContainText('Create index');
      await expect(button).toBeEnabled();
    });
  });

  test.describe('when the flag is off', () => {
    test.use({ featureFlags: { vectorSearchEnhancements: false } });

    test('shows the legacy entry, disabled when the database has no keys', async ({ vectorSearchPage, apiHelper }) => {
      database = await apiHelper.createDatabase(StandaloneEmptyConfigFactory.build());
      await apiHelper.sendCommand(database.id, 'FLUSHDB');
      await apiHelper.deleteAllIndexes(database.id);

      await vectorSearchPage.goto(database.id);
      await expect(vectorSearchPage.welcomeWrapper).toBeVisible();

      const button = vectorSearchPage.welcomeScreen.useMyDatabaseButton;
      await expect(button).toContainText('Use data from my database');
      await expect(button).toBeDisabled();
    });
  });
});
