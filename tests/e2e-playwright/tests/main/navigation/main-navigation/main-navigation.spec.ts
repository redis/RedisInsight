import { test, expect } from 'e2eSrc/fixtures/base';

/**
 * Navigation & Global UI > Main Navigation
 *
 * Tests for the 4 navigation paths in the sidebar:
 * - Settings button navigates to Settings page
 * - Redis logo navigates to home
 * - GitHub repo link
 * - Redis Cloud link
 */
test.describe('Navigation & Global UI > Main Navigation', () => {
  test.beforeEach(async ({ sidebarPanel }) => {
    await sidebarPanel.goto();
    await sidebarPanel.waitForLoad();
  });

  test('should navigate to Settings page', async ({ sidebarPanel, settingsPage }) => {
    await expect(sidebarPanel.settingsButton).toBeVisible();

    await sidebarPanel.settingsButton.click();
    await settingsPage.waitForLoad();
    await expect(settingsPage.pageTitle).toBeVisible();
  });

  test('should navigate to home via Redis logo', async ({ sidebarPanel, settingsPage }) => {
    await expect(sidebarPanel.mainNavigation).toBeVisible();
    await expect(sidebarPanel.redisLogo).toBeVisible();

    // Navigate away from home to Settings
    await settingsPage.goto();
    await expect(settingsPage.pageTitle).toBeVisible();

    // Click Redis logo to go back home
    await sidebarPanel.redisLogo.click();
    await expect(sidebarPanel.homeTabs).toBeVisible();
  });

  test('should open GitHub repo in new tab', async ({ page, sidebarPanel }) => {
    await expect(sidebarPanel.githubLink).toBeVisible();

    const popupPromise = page.waitForEvent('popup');
    await sidebarPanel.githubLink.click();
    const popup = await popupPromise;

    await expect(popup).toHaveURL(/github/i);
    await popup.close();
  });

  test('should open Redis Cloud in new tab', async ({ page, sidebarPanel }) => {
    await expect(sidebarPanel.cloudLink).toBeVisible();

    const popupPromise = page.waitForEvent('popup');
    await sidebarPanel.cloudLink.click();
    const popup = await popupPromise;

    await expect(popup).toHaveURL(/redis\.io\/try-free/i);
    await popup.close();
  });
});
