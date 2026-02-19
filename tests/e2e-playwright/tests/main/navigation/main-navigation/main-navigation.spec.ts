import { test, expect } from 'e2eSrc/fixtures/base';

/**
 * Navigation & Global UI > Main Navigation
 *
 * Tests for the global sidebar navigation elements including:
 * - Visibility of main navigation, Redis logo, settings button, links
 * - Navigation to home via Redis logo
 * - Navigation to Settings page
 */
test.describe('Navigation & Global UI > Main Navigation', () => {
  test.beforeEach(async ({ sidebarPanel }) => {
    await sidebarPanel.goto();
    await sidebarPanel.waitForLoad();
  });

  test('should display main navigation', async ({ sidebarPanel }) => {
    await expect(sidebarPanel.mainNavigation).toBeVisible();
  });

  test('should show Redis logo', async ({ sidebarPanel }) => {
    await expect(sidebarPanel.redisLogo).toBeVisible();
  });

  test('should show settings button', async ({ sidebarPanel }) => {
    await expect(sidebarPanel.settingsButton).toBeVisible();
  });

  test('should show GitHub repo link', async ({ sidebarPanel }) => {
    await expect(sidebarPanel.githubLink).toBeVisible();
    await expect(sidebarPanel.githubLink).toHaveAttribute('href', /github/i);
  });

  test('should show Redis Cloud link', async ({ sidebarPanel }) => {
    await expect(sidebarPanel.cloudLink).toBeVisible();
  });

  test('should navigate to home via Redis logo', async ({ sidebarPanel, settingsPage }) => {
    // Navigate away from home to Settings
    await settingsPage.goto();
    await expect(settingsPage.pageTitle).toBeVisible();

    // Click Redis logo to go back home
    await sidebarPanel.redisLogo.click();
    await expect(sidebarPanel.homeTabs).toBeVisible();
  });

  test('should navigate to Settings page', async ({ sidebarPanel, settingsPage }) => {
    await sidebarPanel.settingsButton.click();
    await settingsPage.waitForLoad();
    await expect(settingsPage.pageTitle).toBeVisible();
  });
});
