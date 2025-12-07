import { test, expect } from '../../../fixtures/base';
import { Tags } from '../../../config';
import { getStandaloneConfig } from '../../../test-data/databases';
import { getStringKeyData } from '../../../test-data/browser';
import { BrowserPage } from '../../../pages/browser';

test.describe('Browser > Bulk Actions', () => {
  let databaseId: string;
  let browserPage: BrowserPage;
  const bulkDeletePrefix = 'test-bulk-delete-';

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

  test.beforeEach(async ({ createBrowserPage }) => {
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

    test(`should bulk delete keys by pattern ${Tags.CRITICAL}`, async ({ apiHelper }) => {
      // Use unique prefix for this test run
      const uniqueId = Date.now().toString(36);
      const testPrefix = `${bulkDeletePrefix}${uniqueId}-`;

      // Create test keys for bulk deletion
      const keysToCreate = 3;
      for (let i = 0; i < keysToCreate; i++) {
        const keyData = getStringKeyData({ keyName: `${testPrefix}${i}` });
        await apiHelper.createStringKey(databaseId, keyData.keyName, keyData.value);
      }

      // Refresh and search for the keys
      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(`${testPrefix}*`);

      // Wait for keys to appear
      await expect(async () => {
        const count = await browserPage.keyList.getKeyCount();
        expect(count).toBe(keysToCreate);
      }).toPass({ timeout: 10000 });

      // Open bulk actions panel
      await browserPage.bulkActionsPanel.open();

      // Verify expected key count
      const expectedCount = await browserPage.bulkActionsPanel.getExpectedKeyCount();
      expect(expectedCount).toBe(keysToCreate);

      // Perform bulk delete (click delete, confirm, wait for completion)
      await browserPage.bulkActionsPanel.performBulkDelete();

      // Refresh and verify keys are deleted
      await browserPage.keyList.refresh();
      await browserPage.keyList.searchKeys(`${testPrefix}*`);

      // Verify no keys found
      await expect(async () => {
        const count = await browserPage.keyList.getKeyCount();
        expect(count).toBe(0);
      }).toPass({ timeout: 10000 });
    });
  });

  test.describe('Upload Data', () => {
    test(`should show file upload area ${Tags.SMOKE}`, async ({ page }) => {
      await page.getByTestId('btn-bulk-actions').click();
      await page.getByRole('tab', { name: 'Upload Data' }).click();

      // Should show upload instructions or button
      await expect(page.getByText(/Select or drag/i)).toBeVisible();
    });

    test(`should bulk upload data from file ${Tags.CRITICAL}`, async ({ apiHelper }) => {
      const uniqueId = Date.now().toString(36);
      const testKey = `${bulkDeletePrefix}upload-${uniqueId}`;
      const testValue = `test-value-${uniqueId}`;

      // Create a temporary file with Redis commands
      const fs = await import('fs');
      const path = await import('path');
      const os = await import('os');

      const tempDir = os.tmpdir();
      const tempFile = path.join(tempDir, `bulk-upload-${uniqueId}.txt`);
      const commands = `SET ${testKey} "${testValue}"`;
      fs.writeFileSync(tempFile, commands);

      try {
        // Open bulk actions panel and upload file
        await browserPage.bulkActionsPanel.open();
        await browserPage.bulkActionsPanel.performBulkUpload(tempFile);

        // Verify upload completed
        await expect(browserPage.bulkActionsPanel.uploadStatusCompleted).toBeVisible();

        // Close panel and verify key was created
        await browserPage.bulkActionsPanel.close();

        // Search for the key
        await browserPage.keyList.searchKeys(testKey);

        // Verify key exists
        await expect(async () => {
          const count = await browserPage.keyList.getKeyCount();
          expect(count).toBe(1);
        }).toPass({ timeout: 10000 });
      } finally {
        // Cleanup: delete the test key and temp file
        fs.unlinkSync(tempFile);
        await apiHelper.deleteKeysByPattern(databaseId, testKey);
      }
    });
  });
});

