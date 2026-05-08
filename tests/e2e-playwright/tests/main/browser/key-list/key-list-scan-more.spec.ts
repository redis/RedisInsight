import { test, expect } from 'e2eSrc/fixtures/base';
import { databaseFactories } from 'e2eSrc/test-data/databases';
import { ConnectionType, DatabaseInstance } from 'e2eSrc/types';

test.describe('Browser > Key List View (large dataset)', () => {
  let bigDatabase: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    const config = databaseFactories[ConnectionType.StandaloneBig].build();
    bigDatabase = await apiHelper.createDatabase(config);
  });

  test.afterAll(async ({ apiHelper }) => {
    if (bigDatabase?.id) {
      await apiHelper.deleteDatabase(bigDatabase.id);
    }
  });

  test.afterEach(async ({ browserPage }) => {
    // Restore the default list view so this suite doesn't leak tree-view state to other specs in the same worker.
    await browserPage.keyList.switchToListView();
  });

  test('should display keys summary and scroll key list in list view', async ({ browserPage }) => {
    await browserPage.goto(bigDatabase.id);
    await browserPage.keyList.switchToListView();
    await browserPage.keyList.waitForKeysLoaded();

    await expect(browserPage.keyList.keysSummary).toBeVisible();
    await expect(browserPage.keyList.totalCount.first()).toBeVisible();

    const topKey = browserPage.keyList.keyListTable
      .getByTestId('virtual-table-container')
      .locator('[data-testid^="key-"]')
      .first();

    await expect(topKey).toBeVisible();
    const idBefore = await topKey.getAttribute('data-testid');
    expect(idBefore).toBeTruthy();

    await browserPage.keyList.scrollKeysPanelVertically(800);

    await expect(topKey).not.toHaveAttribute('data-testid', idBefore!);
  });

  test('should increase Results or Scanned after Scan more in tree view on large dataset', async ({ browserPage }) => {
    await browserPage.goto(bigDatabase.id);
    await browserPage.keyList.switchToTreeView();
    await browserPage.keyList.waitForKeysLoaded();

    await expect(browserPage.keyList.keysSummary).toBeVisible();

    const resultsBefore = await browserPage.keyList.getFooterResultsCount();
    const scannedBefore = await browserPage.keyList.getFooterScannedCount();
    expect(resultsBefore).toBeGreaterThan(0);

    await expect(browserPage.keyList.scanMoreButton).toBeVisible();
    await browserPage.keyList.scanMore();

    await expect
      .poll(async () => {
        const results = await browserPage.keyList.getFooterResultsCount();
        const scanned = await browserPage.keyList.getFooterScannedCount();
        return results > resultsBefore || scanned > scannedBefore;
      })
      .toBe(true);
  });
});
