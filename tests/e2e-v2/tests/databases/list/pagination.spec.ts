import { test, expect } from '../../../fixtures/base';
import { getStandaloneConfig, TEST_DB_PREFIX } from '../../../test-data/databases';
import { Tags } from '../../../config';

// Pagination is enabled when there are more than 15 databases
const PAGINATION_THRESHOLD = 15;
const DATABASES_TO_CREATE = 20; // Create more than threshold to trigger pagination

// Run tests serially to avoid parallel test interference with shared database state
test.describe.serial('Database List > Pagination', () => {
  let uniquePrefix: string;
  const createdDatabaseIds: string[] = [];

  test.beforeAll(async ({ apiHelper }) => {
    // Generate unique prefix for this test run
    const uniqueId = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
    uniquePrefix = `${TEST_DB_PREFIX}pag-${uniqueId}`;

    // Create databases to trigger pagination
    for (let i = 0; i < DATABASES_TO_CREATE; i++) {
      const config = getStandaloneConfig({
        name: `${uniquePrefix}-db-${String(i).padStart(2, '0')}`,
      });
      const database = await apiHelper.createDatabase(config);
      createdDatabaseIds.push(database.id);
    }
  });

  test.afterAll(async ({ apiHelper }) => {
    // Delete all created databases
    for (const id of createdDatabaseIds) {
      await apiHelper.deleteDatabase(id).catch(() => {});
    }
  });

  test.beforeEach(async ({ databasesPage }) => {
    await databasesPage.goto();
    await databasesPage.reload();
  });

  test(`should show pagination when more than ${PAGINATION_THRESHOLD} databases ${Tags.SMOKE}`, async ({
    databasesPage,
  }) => {
    const { databaseList } = databasesPage;

    // Pagination should be visible
    const isPaginationVisible = await databaseList.isPaginationVisible();
    expect(isPaginationVisible).toBe(true);
  });

  test(`should navigate to next page ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    const { databaseList } = databasesPage;

    // Get initial page info
    const initialPageInfo = await databaseList.paginationPageInfo.textContent();
    expect(initialPageInfo).toContain('1 of');

    // Go to next page
    await databaseList.goToNextPage();

    // Page info should change
    const newPageInfo = await databaseList.paginationPageInfo.textContent();
    expect(newPageInfo).toContain('2 of');
  });

  test(`should navigate to previous page ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    const { databaseList } = databasesPage;

    // Go to next page first
    await databaseList.goToNextPage();
    const secondPageInfo = await databaseList.paginationPageInfo.textContent();
    expect(secondPageInfo).toContain('2 of');

    // Go back to previous page
    await databaseList.goToPreviousPage();
    const firstPageInfo = await databaseList.paginationPageInfo.textContent();
    expect(firstPageInfo).toContain('1 of');
  });

  test(`should navigate to first page ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    const { databaseList } = databasesPage;

    // Go to last page first
    await databaseList.goToLastPage();

    // Go to first page
    await databaseList.goToFirstPage();

    // Previous button should be disabled on first page
    const isPreviousEnabled = await databaseList.isPreviousPageEnabled();
    expect(isPreviousEnabled).toBe(false);
  });

  test(`should navigate to last page ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    const { databaseList } = databasesPage;

    // Go to last page
    await databaseList.goToLastPage();

    // Next button should be disabled on last page
    const isNextEnabled = await databaseList.isNextPageEnabled();
    expect(isNextEnabled).toBe(false);
  });

  test(`should disable previous button on first page ${Tags.REGRESSION}`, async ({
    databasesPage,
  }) => {
    const { databaseList } = databasesPage;

    // We start on first page by default
    // Previous button should be disabled
    const isPreviousEnabled = await databaseList.isPreviousPageEnabled();
    expect(isPreviousEnabled).toBe(false);

    // First page button should also be disabled
    const isFirstPageEnabled = await databaseList.isFirstPageEnabled();
    expect(isFirstPageEnabled).toBe(false);
  });

  test(`should enable next button when not on last page ${Tags.REGRESSION}`, async ({
    databasesPage,
  }) => {
    const { databaseList } = databasesPage;

    // We start on first page by default
    // Next button should be enabled (we have more than one page)
    const isNextEnabled = await databaseList.isNextPageEnabled();
    expect(isNextEnabled).toBe(true);

    // Last page button should also be enabled
    const isLastPageEnabled = await databaseList.isLastPageEnabled();
    expect(isLastPageEnabled).toBe(true);
  });

  test(`should show correct row count ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    const { databaseList } = databasesPage;

    // Get row count text
    const rowCountText = await databaseList.getRowCountText();

    // Should show "Showing X out of Y rows" format
    expect(rowCountText).toMatch(/Showing \d+ out of \d+ rows/);

    // With 10 items per page, should show "Showing 10 out of X rows"
    expect(rowCountText).toContain('Showing 10 out of');
  });

  test(`should change items per page ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    const { databaseList } = databasesPage;

    // Default is 10 items per page
    const initialItemsPerPage = await databaseList.getItemsPerPage();
    expect(initialItemsPerPage).toContain('10');

    // Get initial row count to know total
    const initialRowCount = await databaseList.getRowCountText();
    const totalMatch = initialRowCount.match(/out of (\d+) rows/);
    const totalRows = totalMatch ? parseInt(totalMatch[1], 10) : 0;

    // Change to 25 items per page
    await databaseList.setItemsPerPage('25');

    // Wait for page to update - should show up to 25 rows
    await expect(async () => {
      const rowCountText = await databaseList.getRowCountText();
      const expectedShowing = Math.min(25, totalRows);
      expect(rowCountText).toContain(`Showing ${expectedShowing} out of ${totalRows} rows`);
    }).toPass({ timeout: 5000 });
  });

  test(`should select page from dropdown ${Tags.REGRESSION}`, async ({ databasesPage }) => {
    const { databaseList } = databasesPage;

    // Start on page 1
    const initialPage = await databaseList.getCurrentPage();
    expect(initialPage).toContain('1');

    // Select page 2 from dropdown
    await databaseList.selectPage('2');

    // Verify we're on page 2
    await expect(async () => {
      const pageInfo = await databaseList.paginationPageInfo.textContent();
      expect(pageInfo).toContain('2 of');
    }).toPass({ timeout: 5000 });
  });
});

