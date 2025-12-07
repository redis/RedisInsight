import { Page, Locator, expect } from '@playwright/test';

/**
 * Base Page Object class with common functionality
 * All page objects should extend this class
 */
export abstract class BasePage {
  readonly page: Page;

  // Common UI elements
  readonly loadingSpinner: Locator;
  readonly toastSuccess: Locator;
  readonly toastError: Locator;
  readonly toastContainer: Locator;

  constructor(page: Page) {
    this.page = page;

    // Common locators
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"], .loading-spinner');
    this.toastSuccess = page.locator('.toast-success, [data-testid="toast-success"]');
    this.toastError = page.locator('.toast-error, [data-testid="toast-error"]');
    this.toastContainer = page.locator('.Toastify, [data-testid="toast-container"]');
  }

  /**
   * Navigate to this page's URL
   * Must be implemented by each page
   * @param options - Optional navigation options (e.g., databaseId)
   */
  abstract goto(...args: unknown[]): Promise<void>;

  /**
   * Wait for page to be fully loaded
   * Override in child classes for page-specific loading indicators
   */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.waitForSpinnerToDisappear();
  }

  /**
   * Wait for loading spinner to disappear
   */
  async waitForSpinnerToDisappear(timeout = 30000): Promise<void> {
    try {
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout });
    } catch {
      // Spinner might not appear at all, which is fine
    }
  }

  /**
   * Wait for a success toast to appear
   */
  async waitForSuccessToast(timeout = 10000): Promise<void> {
    await expect(this.toastSuccess).toBeVisible({ timeout });
  }

  /**
   * Wait for an error toast to appear
   */
  async waitForErrorToast(timeout = 10000): Promise<void> {
    await expect(this.toastError).toBeVisible({ timeout });
  }

  /**
   * Dismiss all toasts
   */
  async dismissToasts(): Promise<void> {
    const closeButtons = this.toastContainer.locator('button[aria-label="close"], .Toastify__close-button');
    const count = await closeButtons.count();
    for (let i = 0; i < count; i++) {
      await closeButtons
        .nth(i)
        .click()
        .catch(() => {});
    }
  }

  /**
   * Take a screenshot for debugging
   */
  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
  }

  /**
   * Get current page URL
   */
  getUrl(): string {
    return this.page.url();
  }

  /**
   * Check if element is visible
   */
  async isVisible(locator: Locator, timeout = 5000): Promise<boolean> {
    try {
      await expect(locator).toBeVisible({ timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for URL to contain specific path
   */
  async waitForUrl(urlPattern: string | RegExp, timeout = 10000): Promise<void> {
    await this.page.waitForURL(urlPattern, { timeout });
  }

  /**
   * Reload the page and wait for load
   */
  async reload(): Promise<void> {
    await this.page.reload();
    await this.waitForLoad();
  }

  /**
   * Press keyboard shortcut
   */
  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  /**
   * Get text content of an element
   */
  async getText(locator: Locator): Promise<string | null> {
    return locator.textContent();
  }

  /**
   * Fill input with clear first
   */
  async fillInput(locator: Locator, value: string): Promise<void> {
    await locator.clear();
    await locator.fill(value);
  }

  /**
   * Click and wait for navigation
   */
  async clickAndWaitForNavigation(locator: Locator): Promise<void> {
    await Promise.all([this.page.waitForURL(/.*/, { waitUntil: 'domcontentloaded' }), locator.click()]);
  }
}
