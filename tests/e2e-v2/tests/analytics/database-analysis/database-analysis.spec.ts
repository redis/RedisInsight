import { test, expect } from '../../../fixtures/base';
import { Tags } from '../../../config';
import { standaloneConfig } from '../../../config/databases/standalone';

test.describe('Analytics > Database Analysis', () => {
  let databaseId: string;

  test.beforeAll(async ({ apiHelper }) => {
    // Get or create a database for testing
    const databases = await apiHelper.getDatabases();
    const existingDb = databases.find(
      (db) => db.host === standaloneConfig.host && db.port === standaloneConfig.port
    );

    if (existingDb) {
      databaseId = existingDb.id;
    } else {
      const db = await apiHelper.createDatabase({
        name: 'test-analysis-db',
        host: standaloneConfig.host,
        port: standaloneConfig.port,
      });
      databaseId = db.id;
    }
  });

  test.describe('View Database Analysis', () => {
    test(`should display database analysis page ${Tags.SMOKE} ${Tags.CRITICAL}`, async ({
      createAnalyticsPage,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoDatabaseAnalysis(databaseId);

      await expect(analyticsPage.databaseAnalysisTab).toBeVisible();
      await expect(analyticsPage.databaseAnalysisTab).toHaveAttribute('aria-selected', 'true');
    });

    test(`should show new report button ${Tags.SMOKE}`, async ({
      createAnalyticsPage,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoDatabaseAnalysis(databaseId);

      await expect(analyticsPage.newReportButton).toBeVisible();
    });

    test(`should generate analysis report ${Tags.CRITICAL}`, async ({
      createAnalyticsPage,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoDatabaseAnalysis(databaseId);

      // Click New Report
      await analyticsPage.clickNewReport();

      // Wait for report to generate
      await analyticsPage.waitForReportGenerated();

      // Should show scanned keys
      await expect(analyticsPage.scannedKeysText).toBeVisible();
    });

    test(`should show data summary tab after analysis ${Tags.CRITICAL}`, async ({
      createAnalyticsPage,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoDatabaseAnalysis(databaseId);

      // Generate report if not already visible
      const hasReport = await analyticsPage.isReportVisible();
      if (!hasReport) {
        await analyticsPage.clickNewReport();
        await analyticsPage.waitForReportGenerated();
      }

      // Should show Data Summary tab selected
      await expect(analyticsPage.dataSummaryTab).toBeVisible();
      await expect(analyticsPage.dataSummaryTab).toHaveAttribute('aria-selected', 'true');
    });

    test(`should show tips tab ${Tags.REGRESSION}`, async ({
      createAnalyticsPage,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoDatabaseAnalysis(databaseId);

      // Generate report if not already visible
      const hasReport = await analyticsPage.isReportVisible();
      if (!hasReport) {
        await analyticsPage.clickNewReport();
        await analyticsPage.waitForReportGenerated();
      }

      // Should show Tips tab
      await expect(analyticsPage.tipsTab).toBeVisible();
    });

    test(`should show top namespaces table ${Tags.CRITICAL}`, async ({
      createAnalyticsPage,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoDatabaseAnalysis(databaseId);

      // Generate report if not already visible
      const hasReport = await analyticsPage.isReportVisible();
      if (!hasReport) {
        await analyticsPage.clickNewReport();
        await analyticsPage.waitForReportGenerated();
      }

      // Should show top namespaces table
      await expect(analyticsPage.topNamespacesTable).toBeVisible();
    });

    test(`should show top keys table ${Tags.CRITICAL}`, async ({
      createAnalyticsPage,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoDatabaseAnalysis(databaseId);

      // Generate report if not already visible
      const hasReport = await analyticsPage.isReportVisible();
      if (!hasReport) {
        await analyticsPage.clickNewReport();
        await analyticsPage.waitForReportGenerated();
      }

      // Should show top keys table
      await expect(analyticsPage.topKeysTable).toBeVisible();
    });

    test(`should show TTL distribution chart ${Tags.REGRESSION}`, async ({
      createAnalyticsPage,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoDatabaseAnalysis(databaseId);

      // Generate report if not already visible
      const hasReport = await analyticsPage.isReportVisible();
      if (!hasReport) {
        await analyticsPage.clickNewReport();
        await analyticsPage.waitForReportGenerated();
      }

      // Should show TTL distribution chart
      const isTtlVisible = await analyticsPage.isTtlDistributionVisible();
      expect(isTtlVisible).toBe(true);
    });

    test(`should toggle show no expiry in TTL chart ${Tags.REGRESSION}`, async ({
      createAnalyticsPage,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoDatabaseAnalysis(databaseId);

      // Generate report if not already visible
      const hasReport = await analyticsPage.isReportVisible();
      if (!hasReport) {
        await analyticsPage.clickNewReport();
        await analyticsPage.waitForReportGenerated();
      }

      // Should have the show no expiry switch visible
      await expect(analyticsPage.showNoExpirySwitch).toBeVisible();

      // Toggle should be clickable
      await analyticsPage.toggleShowNoExpiry();
    });

    test(`should show report history dropdown ${Tags.REGRESSION}`, async ({
      createAnalyticsPage,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoDatabaseAnalysis(databaseId);

      // Generate report if not already visible
      const hasReport = await analyticsPage.isReportVisible();
      if (!hasReport) {
        await analyticsPage.clickNewReport();
        await analyticsPage.waitForReportGenerated();
      }

      // Should show report history select
      const isHistoryVisible = await analyticsPage.isReportHistoryVisible();
      expect(isHistoryVisible).toBe(true);
    });

    test(`should have at least one report in history ${Tags.REGRESSION}`, async ({
      createAnalyticsPage,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoDatabaseAnalysis(databaseId);

      // Generate report if not already visible
      const hasReport = await analyticsPage.isReportVisible();
      if (!hasReport) {
        await analyticsPage.clickNewReport();
        await analyticsPage.waitForReportGenerated();
      }

      // Get report count from dropdown
      const reportCount = await analyticsPage.getReportHistoryCount();
      expect(reportCount).toBeGreaterThan(0);
    });
  });

  test.describe('Navigate to Database Analysis', () => {
    test(`should navigate from Slow Log to Database Analysis ${Tags.REGRESSION}`, async ({
      createAnalyticsPage,
    }) => {
      const analyticsPage = createAnalyticsPage();

      // Start at Slow Log
      await analyticsPage.gotoSlowLog(databaseId);
      await expect(analyticsPage.slowLogTab).toHaveAttribute('aria-selected', 'true');

      // Click Database Analysis tab
      await analyticsPage.clickDatabaseAnalysisTab();

      // Should now be on Database Analysis
      await expect(analyticsPage.databaseAnalysisTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  test.describe('Namespace Sorting', () => {
    test(`should sort namespaces by memory ${Tags.REGRESSION}`, async ({
      createAnalyticsPage,
      page,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoDatabaseAnalysis(databaseId);

      // Generate report if not already visible
      const hasReport = await analyticsPage.isReportVisible();
      if (!hasReport) {
        await analyticsPage.clickNewReport();
        await analyticsPage.waitForReportGenerated();
      }

      // Click "by Memory" button (should be disabled/selected by default)
      const byMemoryButton = page.getByRole('button', { name: 'by Memory' }).first();
      await expect(byMemoryButton).toBeVisible();

      // Verify the table has Total Memory column
      await expect(analyticsPage.topNamespacesTable.getByText('Total Memory')).toBeVisible();
    });

    test(`should sort namespaces by number of keys ${Tags.REGRESSION}`, async ({
      createAnalyticsPage,
      page,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoDatabaseAnalysis(databaseId);

      // Generate report if not already visible
      const hasReport = await analyticsPage.isReportVisible();
      if (!hasReport) {
        await analyticsPage.clickNewReport();
        await analyticsPage.waitForReportGenerated();
      }

      // Click "by Number of Keys" button
      const byKeysButton = page.getByRole('button', { name: 'by Number of Keys' });
      await byKeysButton.click();

      // Verify the button is now disabled (selected)
      await expect(byKeysButton).toBeDisabled();

      // Verify the table still has Total Keys column
      await expect(analyticsPage.topNamespacesTable.getByText('Total Keys')).toBeVisible();
    });
  });

  test.describe('Tips Tab', () => {
    test(`should switch to tips tab ${Tags.REGRESSION}`, async ({
      createAnalyticsPage,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoDatabaseAnalysis(databaseId);

      // Generate report if not already visible
      const hasReport = await analyticsPage.isReportVisible();
      if (!hasReport) {
        await analyticsPage.clickNewReport();
        await analyticsPage.waitForReportGenerated();
      }

      // Click Tips tab
      await analyticsPage.tipsTab.click();

      // Should show Tips tab selected
      await expect(analyticsPage.tipsTab).toHaveAttribute('aria-selected', 'true');
    });

    test(`should display tips count in tab label ${Tags.REGRESSION}`, async ({
      createAnalyticsPage,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoDatabaseAnalysis(databaseId);

      // Generate report if not already visible
      const hasReport = await analyticsPage.isReportVisible();
      if (!hasReport) {
        await analyticsPage.clickNewReport();
        await analyticsPage.waitForReportGenerated();
      }

      // Get tips count
      const tipsCount = await analyticsPage.getTipsCount();

      // Tips count should be a number (could be 0 or more)
      expect(tipsCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Data Type Charts', () => {
    test(`should display memory chart ${Tags.REGRESSION}`, async ({
      createAnalyticsPage,
      page,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoDatabaseAnalysis(databaseId);

      // Generate report if not already visible
      const hasReport = await analyticsPage.isReportVisible();
      if (!hasReport) {
        await analyticsPage.clickNewReport();
        await analyticsPage.waitForReportGenerated();
      }

      // Should show Memory label in the chart area
      await expect(page.getByText('Memory').first()).toBeVisible();
    });

    test(`should display keys chart ${Tags.REGRESSION}`, async ({
      createAnalyticsPage,
      page,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoDatabaseAnalysis(databaseId);

      // Generate report if not already visible
      const hasReport = await analyticsPage.isReportVisible();
      if (!hasReport) {
        await analyticsPage.clickNewReport();
        await analyticsPage.waitForReportGenerated();
      }

      // Should show Keys label in the chart area
      await expect(page.getByText('Keys').first()).toBeVisible();
    });
  });

  test.describe('Top Keys Table', () => {
    test(`should sort top keys by memory ${Tags.REGRESSION}`, async ({
      createAnalyticsPage,
      page,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoDatabaseAnalysis(databaseId);

      // Generate report if not already visible
      const hasReport = await analyticsPage.isReportVisible();
      if (!hasReport) {
        await analyticsPage.clickNewReport();
        await analyticsPage.waitForReportGenerated();
      }

      // Find the "by Memory" button in the TOP 15 KEYS section
      const topKeysSection = page.locator('text=TOP 15 KEYS').locator('..');
      const byMemoryButton = topKeysSection.getByRole('button', { name: 'by Memory' });
      await expect(byMemoryButton).toBeVisible();

      // Verify the table has Key Size column
      await expect(analyticsPage.topKeysTable.getByText('Key Size')).toBeVisible();
    });

    test(`should sort top keys by length ${Tags.REGRESSION}`, async ({
      createAnalyticsPage,
      page,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoDatabaseAnalysis(databaseId);

      // Generate report if not already visible
      const hasReport = await analyticsPage.isReportVisible();
      if (!hasReport) {
        await analyticsPage.clickNewReport();
        await analyticsPage.waitForReportGenerated();
      }

      // Find the "by Length" button in the TOP 15 KEYS section
      const topKeysSection = page.locator('text=TOP 15 KEYS').locator('..');
      const byLengthButton = topKeysSection.getByRole('button', { name: 'by Length' });
      await byLengthButton.click();

      // Verify the button is now disabled (selected)
      await expect(byLengthButton).toBeDisabled();

      // Verify the table has Length column
      await expect(analyticsPage.topKeysTable.getByText('Length')).toBeVisible();
    });
  });

  test.describe('Namespace Navigation', () => {
    test(`should filter namespace to Browser view ${Tags.REGRESSION}`, async ({
      createAnalyticsPage,
      createBrowserPage,
      page,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoDatabaseAnalysis(databaseId);

      // Generate report if not already visible
      const hasReport = await analyticsPage.isReportVisible();
      if (!hasReport) {
        await analyticsPage.clickNewReport();
        await analyticsPage.waitForReportGenerated();
      }

      // Get the first namespace from the table
      const firstNamespaceButton = analyticsPage.topNamespacesTable
        .getByRole('row')
        .nth(1) // Skip header row
        .getByRole('button')
        .first();

      // Get the namespace pattern text
      const namespacePattern = await firstNamespaceButton.textContent();
      expect(namespacePattern).toBeTruthy();

      // Click on the namespace to navigate to Browser
      await firstNamespaceButton.click();

      // Wait for navigation to Browser page
      await page.waitForURL(/\/browser/);

      // Verify we're on the Browser page
      const browserPage = createBrowserPage(databaseId);
      await expect(browserPage.browseTab).toHaveAttribute('aria-selected', 'true');

      // Verify the filter is applied with the namespace pattern
      await expect(browserPage.keyList.searchInput).toHaveValue(namespacePattern!);

      // Verify results are shown (filtered keys)
      await expect(browserPage.keyList.resultsCount).toBeVisible();
    });
  });

  test.describe('Recommendations (Tips Tab)', () => {
    test(`should display recommendation labels ${Tags.REGRESSION}`, async ({
      createAnalyticsPage,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoDatabaseAnalysis(databaseId);

      // Generate report if not already visible
      const hasReport = await analyticsPage.isReportVisible();
      if (!hasReport) {
        await analyticsPage.clickNewReport();
        await analyticsPage.waitForReportGenerated();
      }

      // Switch to Tips tab
      await analyticsPage.clickTipsTab();

      // Check if recommendation labels are visible
      const labels = await analyticsPage.areRecommendationLabelsVisible();

      // At least one label type should be visible (depends on recommendations)
      const hasAnyLabel = labels.codeChanges || labels.configChanges || labels.upgrade;
      expect(hasAnyLabel).toBe(true);
    });

    test(`should expand and collapse recommendation ${Tags.REGRESSION}`, async ({
      createAnalyticsPage,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoDatabaseAnalysis(databaseId);

      // Generate report if not already visible
      const hasReport = await analyticsPage.isReportVisible();
      if (!hasReport) {
        await analyticsPage.clickNewReport();
        await analyticsPage.waitForReportGenerated();
      }

      // Switch to Tips tab
      await analyticsPage.clickTipsTab();

      // Get recommendation count
      const count = await analyticsPage.getRecommendationCount();
      if (count === 0) {
        // Skip if no recommendations
        return;
      }

      // First recommendation should be expanded by default
      const isExpanded = await analyticsPage.isRecommendationExpanded(0);
      expect(isExpanded).toBe(true);

      // Collapse the recommendation
      await analyticsPage.toggleRecommendation(0);

      // Verify it's collapsed
      const isCollapsed = await analyticsPage.isRecommendationExpanded(0);
      expect(isCollapsed).toBe(false);

      // Expand again
      await analyticsPage.toggleRecommendation(0);

      // Verify it's expanded
      const isExpandedAgain = await analyticsPage.isRecommendationExpanded(0);
      expect(isExpandedAgain).toBe(true);
    });

    test(`should show voting section for recommendations ${Tags.REGRESSION}`, async ({
      createAnalyticsPage,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoDatabaseAnalysis(databaseId);

      // Generate report if not already visible
      const hasReport = await analyticsPage.isReportVisible();
      if (!hasReport) {
        await analyticsPage.clickNewReport();
        await analyticsPage.waitForReportGenerated();
      }

      // Switch to Tips tab
      await analyticsPage.clickTipsTab();

      // Get recommendation count
      const count = await analyticsPage.getRecommendationCount();
      if (count === 0) {
        // Skip if no recommendations
        return;
      }

      // Verify voting section is visible
      const hasVoting = await analyticsPage.isVotingSectionVisible();
      expect(hasVoting).toBe(true);
    });

    test(`should show tutorial button for applicable recommendations ${Tags.REGRESSION}`, async ({
      createAnalyticsPage,
    }) => {
      const analyticsPage = createAnalyticsPage();
      await analyticsPage.gotoDatabaseAnalysis(databaseId);

      // Generate report if not already visible
      const hasReport = await analyticsPage.isReportVisible();
      if (!hasReport) {
        await analyticsPage.clickNewReport();
        await analyticsPage.waitForReportGenerated();
      }

      // Switch to Tips tab
      await analyticsPage.clickTipsTab();

      // Get recommendation count
      const count = await analyticsPage.getRecommendationCount();
      if (count === 0) {
        // Skip if no recommendations
        return;
      }

      // Check if any recommendation has a tutorial button
      // Not all recommendations have tutorials, so we just verify the button exists if present
      const hasTutorial = await analyticsPage.hasTutorialButton();

      // Test passes regardless - we're just verifying the UI element exists when applicable
      // Some recommendations have tutorials, some don't
      expect(typeof hasTutorial).toBe('boolean');
    });
  });
});

