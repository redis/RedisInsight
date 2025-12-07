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
});

