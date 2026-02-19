import { test, expect } from 'e2eSrc/fixtures/base';

/**
 * Navigation & Global UI > Main Navigation
 *
 * Tests for the global sidebar navigation elements including:
 * - Main navigation with Redis logo and navigation to home
 * - Settings button visibility and navigation
 * - GitHub and Redis Cloud external links
 */
test.describe('Navigation & Global UI > Main Navigation', () => {
  test.beforeEach(async ({ sidebarPanel }) => {
    await sidebarPanel.goto();
    await sidebarPanel.waitForLoad();
  });

  test('should display main navigation with logo and navigate home', async ({ sidebarPanel, settingsPage }) => {
    await expect(sidebarPanel.mainNavigation).toBeVisible();
    await expect(sidebarPanel.redisLogo).toBeVisible();

    // Navigate away from home to Settings
    await settingsPage.goto();
    await expect(settingsPage.pageTitle).toBeVisible();

    // Click Redis logo to go back home
    await sidebarPanel.redisLogo.click();
    await expect(sidebarPanel.homeTabs).toBeVisible();
  });

  test('should show settings button and navigate to Settings page', async ({ sidebarPanel, settingsPage }) => {
    await expect(sidebarPanel.settingsButton).toBeVisible();

    await sidebarPanel.settingsButton.click();
    await settingsPage.waitForLoad();
    await expect(settingsPage.pageTitle).toBeVisible();
  });

  test('should show GitHub repo and Redis Cloud links', async ({ sidebarPanel }) => {
    await expect(sidebarPanel.githubLink).toBeVisible();
    await expect(sidebarPanel.githubLink).toHaveAttribute('href', /github/i);
    await expect(sidebarPanel.cloudLink).toBeVisible();
  });
});
