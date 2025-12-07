import { test, expect } from '../../../fixtures/base';
import { Tags } from '../../../config';
import { getStandaloneConfig } from '../../../test-data/databases';

/**
 * Live Recommendations (Tips) Tests
 *
 * Tests for the Insights panel Tips tab which shows database recommendations.
 * Recommendations appear after running database analysis and provide tips
 * to optimize memory usage and improve database performance.
 */
test.describe('Insights > Live Recommendations', () => {
  test(`should open Tips tab in Insights panel ${Tags.SMOKE}`, async ({
    page,
    navigationPage,
    apiHelper,
  }) => {
    // Create a database for this test
    const config = getStandaloneConfig({ name: 'test-tips-tab' });
    const db = await apiHelper.createDatabase(config);

    try {
      // Navigate to the database browser
      await page.goto(`/${db.id}/browser`);
      await page.waitForLoadState('networkidle');

      // Open Insights panel
      await navigationPage.openInsightsPanel();
      await expect(navigationPage.insightsTitle).toBeVisible();

      // Switch to Tips tab
      await navigationPage.switchToTipsTab();

      // Verify Tips tab is selected
      await expect(navigationPage.insightsTipsTab).toHaveAttribute('aria-selected', 'true');
    } finally {
      await apiHelper.deleteDatabase(db.id);
    }
  });

  test(`should show welcome screen when no recommendations ${Tags.REGRESSION}`, async ({
    page,
    navigationPage,
    apiHelper,
  }) => {
    // Create a fresh database with no analysis history
    const config = getStandaloneConfig({ name: 'test-no-recs' });
    const freshDb = await apiHelper.createDatabase(config);

    try {
      // Navigate to the fresh database
      await page.goto(`/${freshDb.id}/browser`);
      await page.waitForLoadState('networkidle');

      // Open Insights panel and switch to Tips
      await navigationPage.openInsightsPanel();
      await navigationPage.switchToTipsTab();

      // Verify welcome screen is shown (no recommendations)
      // Look for the "Welcome to Tips!" text or Analyze Database button
      const analyzeButton = page.getByRole('button', { name: 'Analyze Database' });
      await expect(analyzeButton).toBeVisible();
    } finally {
      await apiHelper.deleteDatabase(freshDb.id);
    }
  });

  test(`should display recommendations after database analysis ${Tags.SMOKE}`, async ({
    page,
    navigationPage,
    apiHelper,
  }) => {
    // Create a database for analysis
    const config = getStandaloneConfig({ name: 'test-analysis-recs' });
    const db = await apiHelper.createDatabase(config);

    try {
      // Navigate to the database browser
      await page.goto(`/${db.id}/browser`);
      await page.waitForLoadState('networkidle');

      // Open Insights panel and switch to Tips
      await navigationPage.openInsightsPanel();
      await navigationPage.switchToTipsTab();

      // Click Analyze Database to trigger analysis
      await navigationPage.clickAnalyzeDatabase();

      // Confirm the analysis dialog
      const confirmButton = page.getByTestId('approve-insights-db-analysis-btn');
      await confirmButton.click();

      // Wait for analysis to complete - it navigates to analysis page
      await page.waitForURL(`**/${db.id}/analytics/database-analysis`, { timeout: 15000 });

      // Wait for analysis to complete
      await page.waitForLoadState('networkidle');

      // The Tips tab in Insights panel should now show recommendations
      // Click on Insights trigger again to open the panel
      await navigationPage.insightsTrigger.click();

      // Wait for the Tips tab to show a count
      await expect(async () => {
        const tabText = await navigationPage.insightsTipsTab.innerText();
        // Should show "Tips (X)" where X > 0
        expect(tabText).toMatch(/Tips\s*\(\d+\)/);
      }).toPass({ timeout: 10000 });
    } finally {
      await apiHelper.deleteDatabase(db.id);
    }
  });

  test(`should show recommendation details with voting ${Tags.REGRESSION}`, async ({
    page,
    navigationPage,
    apiHelper,
  }) => {
    // Create a database and run analysis
    const config = getStandaloneConfig({ name: 'test-voting' });
    const db = await apiHelper.createDatabase(config);

    try {
      // Navigate to the database browser
      await page.goto(`/${db.id}/browser`);
      await page.waitForLoadState('networkidle');

      // Open Insights panel and switch to Tips
      await navigationPage.openInsightsPanel();
      await navigationPage.switchToTipsTab();

      // Trigger analysis
      await navigationPage.clickAnalyzeDatabase();
      const confirmButton = page.getByTestId('approve-insights-db-analysis-btn');
      await confirmButton.click();

      // Wait for analysis page
      await page.waitForURL(`**/${db.id}/analytics/database-analysis`, { timeout: 15000 });
      await page.waitForLoadState('networkidle');

      // Open insights and switch to Tips
      await navigationPage.insightsTrigger.click();
      await navigationPage.switchToTipsTab();

      // Wait for recommendations to appear
      await expect(async () => {
        const count = await navigationPage.getTipsCount();
        expect(count).toBeGreaterThan(0);
      }).toPass({ timeout: 10000 });

      // Verify voting section is visible (at least one recommendation should have voting)
      // Look for "Is this useful?" text
      const votingText = page.getByText('Is this useful?').first();
      await expect(votingText).toBeVisible({ timeout: 5000 });
    } finally {
      await apiHelper.deleteDatabase(db.id);
    }
  });
});

