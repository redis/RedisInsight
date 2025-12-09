import { test, expect } from '../../../fixtures/base';
import { Tags } from '../../../config';
import { standaloneConfig } from '../../../config/databases/standalone';
import { DatabaseInstance } from '../../../types';
import { TEST_DB_PREFIX } from '../../../test-data/databases';

test.describe.serial('Analytics > Slow Log', () => {
  let database: DatabaseInstance;
  const dbName = `${TEST_DB_PREFIX}slow-log-db`;

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase({
      name: dbName,
      host: standaloneConfig.host,
      port: standaloneConfig.port,
    });
  });

  test.afterAll(async ({ apiHelper }) => {
    await apiHelper.deleteDatabase(database.id);
  });

  test.describe('View Slow Log', () => {
    test.beforeEach(async ({ analyticsPage }) => {
      await analyticsPage.gotoSlowLog(database.id);
    });

    test(`should display slow log page ${Tags.SMOKE} ${Tags.CRITICAL}`, async ({ analyticsPage }) => {
      await expect(analyticsPage.slowLogTab).toBeVisible();
      await expect(analyticsPage.slowLogTab).toHaveAttribute('aria-selected', 'true');
    });

    test(`should show slow log table with entries ${Tags.CRITICAL}`, async ({ analyticsPage }) => {
      // Generate slow log entries by setting threshold to 0 (logs all commands)
      await analyticsPage.generateSlowLogEntries();

      // Table should now be visible with entries
      await expect(analyticsPage.slowLogTable).toBeVisible();

      // Should have some entries
      const hasEntries = await analyticsPage.hasSlowLogEntries();
      expect(hasEntries).toBe(true);
    });

    test(`should show execution time configuration ${Tags.REGRESSION}`, async ({ analyticsPage }) => {
      // Should show execution time text
      await expect(analyticsPage.executionTimeText).toBeVisible();
    });

    test(`should show configure button ${Tags.REGRESSION}`, async ({ analyticsPage }) => {
      await expect(analyticsPage.configureButton).toBeVisible();
    });

    test(`should show clear slow log button when entries exist ${Tags.REGRESSION}`, async ({ analyticsPage }) => {
      // Generate entries first (Clear button only visible when there are entries)
      await analyticsPage.generateSlowLogEntries();

      await expect(analyticsPage.clearSlowLogButton).toBeVisible();
    });

    test(`should show display up to dropdown ${Tags.REGRESSION}`, async ({ analyticsPage }) => {
      await expect(analyticsPage.displayUpToDropdown).toBeVisible();
    });

    test(`should refresh slow log ${Tags.CRITICAL}`, async ({ page, analyticsPage }) => {
      // Generate entries first so we have something to refresh
      await analyticsPage.generateSlowLogEntries();

      // Wait for table to load
      await expect(analyticsPage.slowLogTable).toBeVisible();

      // Click refresh button
      await analyticsPage.refreshSlowLog();

      // Verify "Last refresh: now" is visible
      await expect(page.getByText(/Last refresh:.*now/)).toBeVisible();
    });
  });

  test.describe('Navigate to Slow Log', () => {
    test.beforeEach(async ({ analyticsPage }) => {
      await analyticsPage.gotoSlowLog(database.id);
    });

    test(`should navigate from Database Analysis to Slow Log ${Tags.REGRESSION}`, async ({ analyticsPage }) => {
      // Start at Database Analysis
      await analyticsPage.gotoDatabaseAnalysis(database.id);
      await expect(analyticsPage.databaseAnalysisTab).toHaveAttribute('aria-selected', 'true');

      // Click Slow Log tab
      await analyticsPage.clickSlowLogTab();

      // Should now be on Slow Log
      await expect(analyticsPage.slowLogTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  test.describe('Sort Entries', () => {
    test.beforeEach(async ({ analyticsPage }) => {
      await analyticsPage.gotoSlowLog(database.id);

    });

    test(`should sort entries by duration ${Tags.REGRESSION}`, async ({ page, analyticsPage }) => {
      // Generate entries first
      await analyticsPage.generateSlowLogEntries();

      // Wait for table to load
      await expect(analyticsPage.slowLogTable).toBeVisible();

      // Click on Duration column header to sort
      const durationHeader = page.getByRole('button', { name: 'Duration, msec' });
      await durationHeader.click();

      // Verify sorting indicator appears
      await expect(page.getByText(/Sorted by Duration/)).toBeVisible();
    });

    test(`should sort entries by timestamp ${Tags.REGRESSION}`, async ({ page, analyticsPage }) => {
      // Generate entries first
      await analyticsPage.generateSlowLogEntries();

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
    test.beforeEach(async ({ analyticsPage }) => {
      await analyticsPage.gotoSlowLog(database.id);

    });

    test(`should display command timestamp, duration, and execution details ${Tags.REGRESSION}`, async ({ page, analyticsPage }) => {
      // Generate entries first
      await analyticsPage.generateSlowLogEntries();

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

    test(`should display configuration values ${Tags.REGRESSION}`, async ({ page }) => {
      // Verify execution time and max length configuration is displayed
      // Format: "Execution time: X msec, Max length: Y"
      await expect(page.getByText(/Execution time:.*msec.*Max length:/)).toBeVisible();
    });
  });

  test.describe('Empty State', () => {
    test.beforeEach(async ({ analyticsPage }) => {
      await analyticsPage.gotoSlowLog(database.id);

    });

    test(`should display empty state message when no slow log entries ${Tags.REGRESSION}`, async ({ analyticsPage }) => {
      // Check if slow log is empty or has entries
      const isEmpty = await analyticsPage.isSlowLogEmpty();

      if (isEmpty) {
        // Verify empty state is displayed
        await expect(analyticsPage.slowLogEmptyState).toBeVisible();
        await expect(analyticsPage.slowLogEmptyStateMessage).toBeVisible();

        // Verify the message contains expected text
        await expect(analyticsPage.slowLogEmptyStateMessage).toContainText('Either no commands exceeding');
        await expect(analyticsPage.slowLogEmptyStateMessage).toContainText('Slow Log is disabled');
      } else {
        // If there are entries, clear them first
        await analyticsPage.clearSlowLog();

        // Verify empty state is displayed after clearing
        await expect(analyticsPage.slowLogEmptyState).toBeVisible();
        await expect(analyticsPage.slowLogEmptyStateMessage).toBeVisible();

        // Verify the message contains expected text
        await expect(analyticsPage.slowLogEmptyStateMessage).toContainText('Either no commands exceeding');
        await expect(analyticsPage.slowLogEmptyStateMessage).toContainText('Slow Log is disabled');
      }
    });
  });

  test.describe('Configuration', () => {
    test.beforeEach(async ({ analyticsPage }) => {
      await analyticsPage.gotoSlowLog(database.id);

    });

    test(`should adjust slowlog-log-slower-than threshold ${Tags.REGRESSION}`, async ({ page, analyticsPage }) => {
      // Get initial threshold value
      const initialThreshold = await analyticsPage.getExecutionTimeThreshold();

      // Open configuration dialog
      await analyticsPage.openSlowLogConfig();

      // Set a new threshold value (different from current)
      const newThreshold = initialThreshold === '10' ? '20' : '10';
      await analyticsPage.setSlowLogThreshold(newThreshold);

      // Save configuration
      await analyticsPage.saveSlowLogConfig();

      // Verify the threshold was updated in the header
      await expect(page.getByText(new RegExp(`Execution time:\\s*${newThreshold}\\s*msec`))).toBeVisible();

      // Restore original threshold
      await analyticsPage.openSlowLogConfig();
      await analyticsPage.setSlowLogThreshold(initialThreshold);
      await analyticsPage.saveSlowLogConfig();

      // Verify restored
      await expect(page.getByText(new RegExp(`Execution time:\\s*${initialThreshold}\\s*msec`))).toBeVisible();
    });

    test(`should open and cancel configuration dialog ${Tags.REGRESSION}`, async ({ page, analyticsPage }) => {
      // Get initial threshold value
      const initialThreshold = await analyticsPage.getExecutionTimeThreshold();

      // Open configuration dialog
      await analyticsPage.openSlowLogConfig();

      // Change the value
      const newThreshold = initialThreshold === '10' ? '50' : '10';
      await analyticsPage.setSlowLogThreshold(newThreshold);

      // Cancel instead of save
      await analyticsPage.cancelSlowLogConfig();

      // Verify the threshold was NOT changed
      await expect(page.getByText(new RegExp(`Execution time:\\s*${initialThreshold}\\s*msec`))).toBeVisible();
    });
  });
});

