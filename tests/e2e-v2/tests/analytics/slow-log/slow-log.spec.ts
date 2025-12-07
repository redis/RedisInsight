import { test, expect } from '../../../fixtures/base';
import { Tags } from '../../../config';
import { standaloneConfig } from '../../../config/databases/standalone';

test.describe('Analytics > Slow Log', () => {
  let databaseId: string;

  test.beforeAll(async ({ apiHelper }) => {
    // Get or create a database for testing
    const databases = await apiHelper.getDatabases();
    const existingDb = databases.find(
      (db) => db.host === standaloneConfig.host && db.port === standaloneConfig.port
    );

    if (existingDb) {
      databaseId = existingDb.id;
    } else {
      const db = await apiHelper.createDatabase({
        name: 'test-slow-log-db',
        host: standaloneConfig.host,
        port: standaloneConfig.port,
      });
      databaseId = db.id;
    }
  });

  test.describe('View Slow Log', () => {
    test(`should display slow log page ${Tags.SMOKE} ${Tags.CRITICAL}`, async ({
      createAnalyticsPage,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoSlowLog(databaseId);

      await expect(analyticsPage.slowLogTab).toBeVisible();
      await expect(analyticsPage.slowLogTab).toHaveAttribute('aria-selected', 'true');
    });

    test(`should show slow log table with entries ${Tags.CRITICAL}`, async ({
      createAnalyticsPage,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoSlowLog(databaseId);

      // Table should be visible
      await expect(analyticsPage.slowLogTable).toBeVisible();

      // Should have some entries (from previous operations)
      const hasEntries = await analyticsPage.hasSlowLogEntries();
      expect(hasEntries).toBe(true);
    });

    test(`should show execution time configuration ${Tags.REGRESSION}`, async ({
      createAnalyticsPage,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoSlowLog(databaseId);

      // Should show execution time text
      await expect(analyticsPage.executionTimeText).toBeVisible();
    });

    test(`should show configure button ${Tags.REGRESSION}`, async ({
      createAnalyticsPage,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoSlowLog(databaseId);

      await expect(analyticsPage.configureButton).toBeVisible();
    });

    test(`should show clear slow log button ${Tags.REGRESSION}`, async ({
      createAnalyticsPage,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoSlowLog(databaseId);

      await expect(analyticsPage.clearSlowLogButton).toBeVisible();
    });

    test(`should show display up to dropdown ${Tags.REGRESSION}`, async ({
      createAnalyticsPage,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoSlowLog(databaseId);

      await expect(analyticsPage.displayUpToDropdown).toBeVisible();
    });

    test(`should refresh slow log ${Tags.CRITICAL}`, async ({
      createAnalyticsPage,
      page,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoSlowLog(databaseId);

      // Wait for initial load
      await expect(analyticsPage.slowLogTable).toBeVisible();

      // Click refresh button
      await analyticsPage.refreshSlowLog();

      // Verify "Last refresh: now" is visible
      await expect(page.getByText(/Last refresh:.*now/)).toBeVisible();
    });
  });

  test.describe('Navigate to Slow Log', () => {
    test(`should navigate from Database Analysis to Slow Log ${Tags.REGRESSION}`, async ({
      createAnalyticsPage,
    }) => {
      const analyticsPage = createAnalyticsPage();

      // Start at Database Analysis
      await analyticsPage.gotoDatabaseAnalysis(databaseId);
      await expect(analyticsPage.databaseAnalysisTab).toHaveAttribute('aria-selected', 'true');

      // Click Slow Log tab
      await analyticsPage.clickSlowLogTab();

      // Should now be on Slow Log
      await expect(analyticsPage.slowLogTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  test.describe('Sort Entries', () => {
    test(`should sort entries by duration ${Tags.REGRESSION}`, async ({
      createAnalyticsPage,
      page,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoSlowLog(databaseId);

      // Wait for table to load
      await expect(analyticsPage.slowLogTable).toBeVisible();

      // Click on Duration column header to sort
      const durationHeader = page.getByRole('button', { name: 'Duration, msec' });
      await durationHeader.click();

      // Verify sorting indicator appears
      await expect(page.getByText(/Sorted by Duration/)).toBeVisible();
    });

    test(`should sort entries by timestamp ${Tags.REGRESSION}`, async ({
      createAnalyticsPage,
      page,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoSlowLog(databaseId);

      // Wait for table to load
      await expect(analyticsPage.slowLogTable).toBeVisible();

      // Click on Timestamp column header to sort
      const timestampHeader = page.getByRole('button', { name: 'Timestamp' });
      await timestampHeader.click();

      // Verify sorting indicator appears
      await expect(page.getByText(/Sorted by Timestamp/)).toBeVisible();
    });
  });

  test.describe('Entry Details', () => {
    test(`should display command timestamp, duration, and execution details ${Tags.REGRESSION}`, async ({
      createAnalyticsPage,
      page,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoSlowLog(databaseId);

      // Wait for table to load
      await expect(analyticsPage.slowLogTable).toBeVisible();

      // Verify table has the expected columns
      await expect(page.getByRole('columnheader', { name: 'Timestamp' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Duration, msec' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Command' })).toBeVisible();

      // Verify first row has timestamp in expected format (YYYY-MM-DD HH:MM:SS)
      const firstRow = analyticsPage.slowLogTable.locator('tbody tr').first();
      const timestampCell = firstRow.locator('td').first();
      const timestampText = await timestampCell.textContent();
      expect(timestampText).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);

      // Verify duration cell has numeric value
      const durationCell = firstRow.locator('td').nth(1);
      const durationText = await durationCell.textContent();
      expect(durationText).toMatch(/[\d\s,.]+/);

      // Verify command cell has content
      const commandCell = firstRow.locator('td').nth(2);
      const commandText = await commandCell.textContent();
      expect(commandText?.length).toBeGreaterThan(0);
    });

    test(`should display configuration values ${Tags.REGRESSION}`, async ({
      createAnalyticsPage,
      page,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoSlowLog(databaseId);

      // Verify execution time and max length configuration is displayed
      // Format: "Execution time: X msec, Max length: Y"
      await expect(page.getByText(/Execution time:.*msec.*Max length:/)).toBeVisible();
    });
  });
});

