import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { TEST_KEY_PREFIX } from 'e2eSrc/test-data/browser';
import { DatabaseInstance } from 'e2eSrc/types';

/**
 * Browser Key Tree View — consolidated E2E (TEST_PLAN 2.2).
 * Large-dataset "Scan more in tree" lives in ./key-list-scan-more.spec.ts.
 *
 * Serial: shared database, several tests mutate tree-view settings
 * (delimiter / sort) and reset them before exiting.
 */
test.describe('Browser > Key Tree View', () => {
  test.describe.configure({ mode: 'serial' });

  let database: DatabaseInstance;
  const suffix = Date.now().toString(36);

  // Colon-delimited tree keys
  const treeFolder = `${TEST_KEY_PREFIX}tree-${suffix}`;
  const usersFolder = `${treeFolder}:users`;
  const userAliceKey = `${usersFolder}:alice`;
  const userBobKey = `${usersFolder}:bob`;
  const flatLeafKey = `${TEST_KEY_PREFIX}leaf-${suffix}`;

  // Underscore-delimited tree keys (used by delimiter-change tests)
  const underscoreTreeFolder = `${TEST_KEY_PREFIX}utree-${suffix}`;
  const underscoreUsersFolder = `${underscoreTreeFolder}_users`;
  const underscoreAliceKey = `${underscoreUsersFolder}_alice`;
  const underscoreBobKey = `${underscoreUsersFolder}_bob`;

  const allTestKeysPattern = `${TEST_KEY_PREFIX}*`;

  test.beforeAll(async ({ apiHelper }) => {
    const config = StandaloneConfigFactory.build({
      name: `test-key-tree-${suffix}`,
    });
    database = await apiHelper.createDatabase(config);
  });

  test.afterEach(async ({ apiHelper, browserPage }) => {
    if (database?.id) {
      await apiHelper.deleteKeysByPattern(database.id, allTestKeysPattern);
    }
    // browserViewType is persisted in localStorage and shared across all specs in the same Electron
    // instance. Tests here briefly force list view; clear the key so the next spec gets the app's
    // true default (Tree) even if a test fails before switching back.
    await browserPage.page.evaluate(() => localStorage.removeItem('browserViewType'));
  });

  test.afterAll(async ({ apiHelper }) => {
    if (database?.id) {
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test('should group keys into folders, expand/collapse them, and show folder badges/tooltip', async ({
    apiHelper,
    browserPage,
  }) => {
    // Seed namespaced keys plus a flat leaf
    await apiHelper.createStringKey(database.id, userAliceKey, 'alice');
    await apiHelper.createStringKey(database.id, userBobKey, 'bob');
    await apiHelper.createStringKey(database.id, flatLeafKey, 'leaf');

    // Open the Browser page in Tree view
    await browserPage.goto(database.id);
    await browserPage.keyList.switchToTreeView();

    // Verify the namespaced folder is present and the flat leaf is rendered as a top-level row
    await expect(browserPage.keyList.getFolderByName(treeFolder)).toBeVisible();
    await expect(browserPage.keyList.getKeyRow(flatLeafKey)).toBeVisible();

    // Verify percentage and key-count badges render for the seeded folder
    const percentage = await browserPage.keyList.getFolderPercentage(treeFolder);
    expect(percentage).toMatch(/\d+%|<1%/);

    const countText = await browserPage.keyList.getFolderCount(treeFolder);
    const countNumber = Number((countText ?? '').replace(/\D/g, ''));
    expect(countNumber).toBeGreaterThan(0);

    // Verify the namespace tooltip surfaces the folder's key pattern (`<folder>:*`) and key count.
    const tooltip = await browserPage.keyList.namespaceTooltip(treeFolder);
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText(`${treeFolder}:*`);
    await expect(tooltip).toContainText(/key\(s\)/);

    // Verify expand reveals the nested child folder
    await browserPage.keyList.expandFolder(treeFolder, usersFolder);
    await expect(browserPage.keyList.getFolderByName(usersFolder)).toBeVisible();

    // Verify collapse hides the nested child folder
    await browserPage.keyList.collapseFolder(treeFolder, usersFolder);
    await expect(browserPage.keyList.getFolderByName(usersFolder)).toBeHidden();
  });

  test('should open tree view settings, change the delimiter and regroup folders', async ({
    apiHelper,
    browserPage,
  }) => {
    // Seed underscore-delimited keys (so they are flat under the default `:` delimiter)
    await apiHelper.createStringKey(database.id, underscoreAliceKey, 'alice');
    await apiHelper.createStringKey(database.id, underscoreBobKey, 'bob');

    // Open the Browser page in Tree view
    await browserPage.goto(database.id);
    await browserPage.keyList.switchToTreeView();

    // With `:` delimiter the underscore keys render as flat leaves (no `utree-*` folder)
    await expect(browserPage.keyList.getKeyRow(underscoreAliceKey)).toBeVisible();
    await expect(browserPage.keyList.getFolderByName(underscoreTreeFolder)).toBeHidden();

    // Verify the settings popover opens with the default `:` delimiter chip
    await browserPage.keyList.openTreeViewSettings();
    expect(await browserPage.keyList.getCurrentDelimiters()).toEqual([':']);

    // Switch the delimiter from `:` to `_`
    await browserPage.keyList.removeDelimiter(':');
    await browserPage.keyList.addDelimiter('_');
    await browserPage.keyList.applyTreeViewSettings();

    // Verify the underscore-delimited folder now appears
    await expect(browserPage.keyList.getFolderByName(underscoreTreeFolder)).toBeVisible();

    // Cleanup: restore default `:` delimiter
    await browserPage.keyList.openTreeViewSettings();
    await browserPage.keyList.removeDelimiter('_');
    await browserPage.keyList.addDelimiter(':');
    await browserPage.keyList.applyTreeViewSettings();
  });

  test('should support multiple delimiters in tree view', async ({ apiHelper, browserPage }) => {
    // Seed both colon- and underscore-delimited keys
    await apiHelper.createStringKey(database.id, userAliceKey, 'alice');
    await apiHelper.createStringKey(database.id, underscoreAliceKey, 'alice');

    // Open the Browser page in Tree view
    await browserPage.goto(database.id);
    await browserPage.keyList.switchToTreeView();

    // Add `_` as a second delimiter (alongside the default `:`)
    await browserPage.keyList.openTreeViewSettings();
    await browserPage.keyList.addDelimiter('_');
    expect(await browserPage.keyList.getCurrentDelimiters()).toEqual([':', '_']);
    await browserPage.keyList.applyTreeViewSettings();

    // Verify both folder hierarchies are rendered
    await expect(browserPage.keyList.getFolderByName(treeFolder)).toBeVisible();
    await expect(browserPage.keyList.getFolderByName(underscoreTreeFolder)).toBeVisible();

    // Cleanup: remove `_` to restore the default single-delimiter setup
    await browserPage.keyList.openTreeViewSettings();
    await browserPage.keyList.removeDelimiter('_');
    await browserPage.keyList.applyTreeViewSettings();
  });

  test('should cancel delimiter change and keep previous delimiter', async ({ apiHelper, browserPage }) => {
    // Seed at least one key so the tree settings button is enabled
    await apiHelper.createStringKey(database.id, userAliceKey, 'alice');

    // Open the Browser page in Tree view
    await browserPage.goto(database.id);
    await browserPage.keyList.switchToTreeView();

    // Add a second delimiter, then cancel without applying
    await browserPage.keyList.openTreeViewSettings();
    await browserPage.keyList.addDelimiter('_');
    expect(await browserPage.keyList.getCurrentDelimiters()).toEqual([':', '_']);
    await browserPage.keyList.cancelTreeViewSettings();

    // Verify the original `:`-only configuration is preserved.
    // The popover resets its local state asynchronously after closing, so poll
    // until the chip set matches the saved (Redux) configuration.
    await browserPage.keyList.openTreeViewSettings();
    await expect.poll(() => browserPage.keyList.getCurrentDelimiters()).toEqual([':']);
    await browserPage.keyList.cancelTreeViewSettings();
  });

  test('should sort tree nodes ascending and descending', async ({ apiHelper, browserPage }) => {
    // Seed keys producing two top-level folders that sort in opposite orders for ASC/DESC
    await apiHelper.createStringKey(database.id, `${TEST_KEY_PREFIX}aaa-${suffix}:k1`, 'a');
    await apiHelper.createStringKey(database.id, `${TEST_KEY_PREFIX}zzz-${suffix}:k1`, 'z');

    // Open the Browser page in Tree view
    await browserPage.goto(database.id);
    await browserPage.keyList.switchToTreeView();

    // Verify ASC order (default) — poll until both seeded folders are rendered and ordered
    await expect
      .poll(async () => {
        const names = await browserPage.keyList.getVisibleTreeFolderNames();
        const aaaIndex = names.findIndex((name) => name.startsWith(`${TEST_KEY_PREFIX}aaa-${suffix}`));
        const zzzIndex = names.findIndex((name) => name.startsWith(`${TEST_KEY_PREFIX}zzz-${suffix}`));
        return aaaIndex !== -1 && zzzIndex !== -1 && aaaIndex < zzzIndex;
      })
      .toBe(true);

    // Switch to DESC and verify ordering flips
    await browserPage.keyList.openTreeViewSettings();
    await browserPage.keyList.changeSortBy('DESC');
    await browserPage.keyList.applyTreeViewSettings();

    await expect
      .poll(async () => {
        const names = await browserPage.keyList.getVisibleTreeFolderNames();
        const aaaIndex = names.findIndex((name) => name.startsWith(`${TEST_KEY_PREFIX}aaa-${suffix}`));
        const zzzIndex = names.findIndex((name) => name.startsWith(`${TEST_KEY_PREFIX}zzz-${suffix}`));
        return aaaIndex !== -1 && zzzIndex !== -1 && aaaIndex > zzzIndex;
      })
      .toBe(true);

    // Cleanup: restore ASC sort
    await browserPage.keyList.openTreeViewSettings();
    await browserPage.keyList.changeSortBy('ASC');
    await browserPage.keyList.applyTreeViewSettings();
  });

  test('should preserve pattern and key-type filters when switching List <-> Tree', async ({
    apiHelper,
    browserPage,
  }) => {
    // Seed mixed types so the type filter has something to narrow
    const stringKey = `${TEST_KEY_PREFIX}filter-str-${suffix}`;
    const hashKeyName = `${TEST_KEY_PREFIX}filter-hash-${suffix}`;
    await apiHelper.createStringKey(database.id, stringKey, 'hello');
    await apiHelper.createHashKey(database.id, hashKeyName, [{ field: 'f1', value: 'v1' }]);

    // Open the Browser page in List view and apply pattern + Hash type filters
    await browserPage.goto(database.id);
    await browserPage.keyList.switchToListView();
    await browserPage.keyList.filterByType('Hash');
    await browserPage.keyList.searchKeys(`${TEST_KEY_PREFIX}filter-*-${suffix}`);

    await expect(browserPage.keyList.getKeyRow(hashKeyName)).toBeVisible();
    await expect(browserPage.keyList.getKeyRow(stringKey)).not.toBeVisible();

    // Switch to Tree view; filters should persist
    await browserPage.keyList.switchToTreeView();
    await expect(browserPage.keyList.searchInput).toHaveValue(`${TEST_KEY_PREFIX}filter-*-${suffix}`);
    await expect(browserPage.keyList.resetFilterButton).toBeVisible();
    await expect(browserPage.keyList.getKeyRow(hashKeyName)).toBeVisible();
    await expect(browserPage.keyList.getKeyRow(stringKey)).not.toBeVisible();
  });

  test('should keep the selected view active after page refresh', async ({ apiHelper, browserPage }) => {
    // Seed a single namespaced key so List view renders a gridcell and Tree view renders a folder
    await apiHelper.createStringKey(database.id, userAliceKey, 'alice');

    // Open the Browser page in List view, reload — list-view rows should still render
    await browserPage.goto(database.id);
    await browserPage.keyList.switchToListView();
    await expect(browserPage.keyList.getKeyRow(userAliceKey)).toBeVisible();

    await browserPage.page.reload();
    await browserPage.keyList.waitForKeysLoaded();
    await expect(browserPage.keyList.getKeyRow(userAliceKey)).toBeVisible();

    // Switch to Tree view, reload — tree-view folder should still render
    await browserPage.keyList.switchToTreeView();
    await expect(browserPage.keyList.getFolderByName(treeFolder)).toBeVisible();

    await browserPage.page.reload();
    await browserPage.keyList.waitForKeysLoaded();
    await expect(browserPage.keyList.getFolderByName(treeFolder)).toBeVisible();
  });
});
