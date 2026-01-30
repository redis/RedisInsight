import { Page } from '@playwright/test';

/**
 * Wait helpers for E2E tests
 *
 * NOTE: Prefer Playwright's built-in auto-waiting assertions when possible:
 * - await expect(locator).toBeVisible()   - auto-waits for visibility
 * - await expect(locator).toBeHidden()    - auto-waits for hidden
 * - await expect(page).toHaveURL()        - auto-waits for URL
 *
 * These helpers are for specific cases where manual waiting is needed.
 */

/**
 * Wait for all network requests to complete
 * Useful after actions that trigger multiple API calls
 */
export async function waitForNetworkIdle(page: Page, options?: { timeout?: number }): Promise<void> {
  await page.waitForLoadState('networkidle', options);
}

/**
 * Wait for a specific API response
 * Useful when you need to wait for a specific endpoint
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  options?: { timeout?: number },
): Promise<void> {
  await page.waitForResponse(urlPattern, options);
}
