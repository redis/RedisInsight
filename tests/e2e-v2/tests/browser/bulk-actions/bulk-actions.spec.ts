import { test, expect } from '../../../fixtures/base';
import { Tags } from '../../../config';
import { getStandaloneConfig } from '../../../test-data/databases';
import { BrowserPage } from '../../../pages/browser';

test.describe('Browser > Bulk Actions', () => {
  let databaseId: string;
  let browserPage: BrowserPage;

  test.beforeAll(async ({ apiHelper }) => {
    const config = getStandaloneConfig();
    const database = await apiHelper.createDatabase(config);
    databaseId = database.id;
  });

  test.afterAll(async ({ apiHelper }) => {
    if (databaseId) {
      await apiHelper.deleteDatabase(databaseId);
    }
  });

  test.beforeEach(async ({ page, createBrowserPage }) => {
    browserPage = createBrowserPage(databaseId);
    await browserPage.goto();
  });

  test.describe('Panel', () => {
    test(`should open Bulk Actions panel ${Tags.SMOKE}`, async ({ page }) => {
      await page.getByTestId('btn-bulk-actions').click();

      // Verify panel is open by checking for the panel title
      await expect(page.getByText('Bulk Actions').first()).toBeVisible();
    });

    test(`should show Delete Keys tab by default ${Tags.REGRESSION}`, async ({ page }) => {
      await page.getByTestId('btn-bulk-actions').click();

      // Delete Keys tab should be selected
      const deleteTab = page.getByRole('tab', { name: 'Delete Keys' });
      await expect(deleteTab).toHaveAttribute('aria-selected', 'true');
    });

    test(`should switch to Upload Data tab ${Tags.REGRESSION}`, async ({ page }) => {
      await page.getByTestId('btn-bulk-actions').click();

      // Click Upload Data tab
      await page.getByRole('tab', { name: 'Upload Data' }).click();

      // Upload Data tab should be selected
      const uploadTab = page.getByRole('tab', { name: 'Upload Data' });
      await expect(uploadTab).toHaveAttribute('aria-selected', 'true');
    });

    test(`should close Bulk Actions panel with close button ${Tags.REGRESSION}`, async ({
      page,
    }) => {
      await page.getByTestId('btn-bulk-actions').click();
      await expect(page.getByText('Bulk Actions').first()).toBeVisible();

      // Close panel using close button
      await page.getByTestId('bulk-close-panel').click();

      // Panel should be closed
      await expect(page.getByRole('tab', { name: 'Delete Keys' })).not.toBeVisible();
    });

    test(`should show message when no pattern set ${Tags.REGRESSION}`, async ({ page }) => {
      await page.getByTestId('btn-bulk-actions').click();

      // Should show info message
      await expect(page.getByText('No pattern or key type set')).toBeVisible();
    });
  });

  test.describe('Delete Keys', () => {
    test(`should filter by pattern for deletion ${Tags.CRITICAL}`, async ({ page }) => {
      await page.getByTestId('btn-bulk-actions').click();

      // Set a filter pattern first in the main search
      await browserPage.keyList.searchKeys('test*');

      // Wait a bit for filter to apply
      await page.waitForTimeout(500);

      // The bulk actions panel should reflect the filter
      await expect(page.getByText('No pattern or key type set')).not.toBeVisible();
    });
  });

  test.describe('Upload Data', () => {
    test(`should show file upload area ${Tags.SMOKE}`, async ({ page }) => {
      await page.getByTestId('btn-bulk-actions').click();
      await page.getByRole('tab', { name: 'Upload Data' }).click();

      // Should show upload instructions or button
      await expect(page.getByText(/Select or drag/i)).toBeVisible();
    });
  });
});

