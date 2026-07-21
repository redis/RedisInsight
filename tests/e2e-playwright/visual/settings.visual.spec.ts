import { test, expect } from '@playwright/test';
import { acceptEula, captureFullPage } from './fixtures';

/**
 * Scene: Settings page (no database required).
 */

test.beforeAll(acceptEula);

test('settings page — full page', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('settings-page-btn').click();
  await expect(page.getByTestId('user-profile-btn').or(page.getByText('General'))).toBeVisible();

  await captureFullPage(page, 'settings-full.png');
});

test('settings page — general section expanded', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('settings-page-btn').click();
  await page.getByText('General', { exact: true }).first().click();

  // The Date/Time "Preview" is a live clock — mask it so it doesn't flake.
  await captureFullPage(page, 'settings-general-expanded.png', {
    mask: [page.getByTestId('data-preview')],
  });
});
