import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance } from 'e2eSrc/types';
import { faker } from '@faker-js/faker';

const DB_COUNT = 20;
const PAGINATION_PREFIX = `test-pag-${faker.string.alphanumeric(4)}-`;

/**
 * Pagination Tests (TEST_PLAN.md: 1.4 Pagination)
 *
 * Tests for database list pagination when there are more than 15 databases.
 * Creates 20 databases in beforeAll to ensure pagination is triggered.
 */
test.describe('Database List Pagination', () => {
  const createdDbs: DatabaseInstance[] = [];

  test.beforeAll(async ({ apiHelper }) => {
    const promises = Array.from({ length: DB_COUNT }, (_, i) => {
      const config = StandaloneConfigFactory.build({
        name: `${PAGINATION_PREFIX}${String(i).padStart(2, '0')}`,
      });
      return apiHelper.createDatabase(config);
    });

    const results = await Promise.all(promises);
    createdDbs.push(...results);
  });

  test.afterAll(async ({ apiHelper }) => {
    const promises = createdDbs.map((db) => {
      if (db?.id) {
        return apiHelper.deleteDatabase(db.id).catch(() => {});
      }
      return Promise.resolve();
    });
    await Promise.all(promises);
  });

  test.beforeEach(async ({ databasesPage }) => {
    await databasesPage.goto();
    const { databaseList } = databasesPage;

    await databaseList.search(PAGINATION_PREFIX);
    await expect(databaseList.paginationRowCount).toContainText(`${DB_COUNT}`);
    // Both page size and page number persist in localStorage across tests.
    // Reset to a known state: 10 items/page on page 1.
    await databaseList.setItemsPerPage('10');
    await databaseList.selectPage('1');
  });

  test('should show pagination when more than 15 databases', async ({ databasesPage }) => {
    const { databaseList } = databasesPage;
    const isPaginationVisible = await databaseList.isPaginationVisible();
    expect(isPaginationVisible).toBe(true);
  });

  test('should navigate to next page', async ({ databasesPage }) => {
    const { databaseList } = databasesPage;

    const firstPageNames = await databaseList.getDatabaseNames();
    await databaseList.goToNextPage();
    const secondPageNames = await databaseList.getDatabaseNames();

    expect(secondPageNames.length).toBeGreaterThan(0);
    // Pages should show different databases
    expect(firstPageNames[0]).not.toBe(secondPageNames[0]);
  });

  test('should navigate to previous page', async ({ databasesPage }) => {
    const { databaseList } = databasesPage;

    const firstPageNames = await databaseList.getDatabaseNames();
    await databaseList.goToNextPage();
    await databaseList.goToPreviousPage();
    const backToFirstPageNames = await databaseList.getDatabaseNames();

    expect(firstPageNames[0]).toBe(backToFirstPageNames[0]);
  });

  test('should navigate to first and last page', async ({ databasesPage }) => {
    const { databaseList } = databasesPage;

    // Go to last page
    await databaseList.goToLastPage();
    const isNextEnabled = await databaseList.isNextPageEnabled();
    expect(isNextEnabled).toBe(false);

    // Go back to first page
    await databaseList.goToFirstPage();
    const isPrevEnabled = await databaseList.isPreviousPageEnabled();
    expect(isPrevEnabled).toBe(false);
  });

  test('should change items per page', async ({ databasesPage }) => {
    const { databaseList } = databasesPage;

    // Change to 25 items per page - all 20 should fit on one page
    await databaseList.setItemsPerPage('25');

    const visibleCount = await databaseList.getVisibleRowCount();
    expect(visibleCount).toBe(DB_COUNT);

    // Pagination nav buttons should be disabled since everything fits on one page
    const isNextEnabled = await databaseList.isNextPageEnabled();
    expect(isNextEnabled).toBe(false);
  });

  test('should select page from dropdown', async ({ databasesPage }) => {
    const { databaseList } = databasesPage;

    // With default 10 items per page and 20 databases, there should be 2 pages
    await databaseList.setItemsPerPage('10');
    await databaseList.selectPage('2');

    const currentPage = await databaseList.getCurrentPage();
    expect(currentPage).toContain('2');
  });

  test('should show correct row count', async ({ databasesPage }) => {
    const { databaseList } = databasesPage;

    const rowCountText = await databaseList.getRowCountText();
    expect(rowCountText).toContain(`${DB_COUNT}`);
    expect(rowCountText).toMatch(/Showing \d+ out of \d+ rows/);
  });

  test('should disable pagination buttons on first page', async ({ databasesPage }) => {
    const { databaseList } = databasesPage;

    // We start on the first page (beforeEach navigates to databases page)
    const isPrevEnabled = await databaseList.isPreviousPageEnabled();
    const isFirstEnabled = await databaseList.isFirstPageEnabled();
    expect(isPrevEnabled).toBe(false);
    expect(isFirstEnabled).toBe(false);

    // Next and last should be enabled
    const isNextEnabled = await databaseList.isNextPageEnabled();
    const isLastEnabled = await databaseList.isLastPageEnabled();
    expect(isNextEnabled).toBe(true);
    expect(isLastEnabled).toBe(true);
  });
});
