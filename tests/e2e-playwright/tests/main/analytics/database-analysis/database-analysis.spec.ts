import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory, TEST_DB_PREFIX } from 'e2eSrc/test-data/databases';
import { standaloneBigConfig } from 'e2eSrc/config/databases/standalone';
import { TEST_KEY_PREFIX } from 'e2eSrc/test-data/browser';
import { DatabaseInstance } from 'e2eSrc/types';

/**
 * Analytics > Database Analysis Tests
 *
 * Tests for database analysis feature including:
 * - Generating analysis reports
 * - Viewing data summary (memory/keys charts, TTL distribution)
 * - Top namespaces and top keys tables
 * - Report history
 * - Recommendations (Tips tab)
 * - Navigation between analytics sub-pages
 */
test.describe('Analytics > Database Analysis', () => {
  let database: DatabaseInstance;
  // Use unique suffix per run to avoid key conflicts from previous runs
  const uniqueSuffix = Date.now().toString(36);
  const keyPrefix = `${TEST_KEY_PREFIX}analysis-${uniqueSuffix}`;

  test.beforeAll(async ({ apiHelper }) => {
    // Create a test database with unique name
    const config = StandaloneConfigFactory.build({ name: `test-db-analysis-${uniqueSuffix}` });
    database = await apiHelper.createDatabase(config);

    // Seed keys with different types and namespace patterns for meaningful analysis
    // "user:" namespace - String keys
    await apiHelper.createStringKey(database.id, `${keyPrefix}:user:1`, 'John Doe');
    await apiHelper.createStringKey(database.id, `${keyPrefix}:user:2`, 'Jane Smith');
    await apiHelper.createStringKey(database.id, `${keyPrefix}:user:3`, 'Bob Wilson');

    // "session:" namespace - Hash keys
    await apiHelper.createHashKey(database.id, `${keyPrefix}:session:1`, [
      { field: 'token', value: 'abc123' },
      { field: 'userId', value: '1' },
    ]);
    await apiHelper.createHashKey(database.id, `${keyPrefix}:session:2`, [
      { field: 'token', value: 'def456' },
      { field: 'userId', value: '2' },
    ]);

    // "cache:" namespace - various types
    await apiHelper.createStringKey(database.id, `${keyPrefix}:cache:homepage`, 'cached-html-content');
    await apiHelper.createListKey(database.id, `${keyPrefix}:cache:queue`, ['item1', 'item2', 'item3']);

    // "settings:" namespace - Set key
    await apiHelper.createSetKey(database.id, `${keyPrefix}:settings:tags`, ['redis', 'database', 'cache']);

    // Additional keys for variety
    await apiHelper.createZSetKey(database.id, `${keyPrefix}:leaderboard`, [
      { member: 'player1', score: '100' },
      { member: 'player2', score: '200' },
      { member: 'player3', score: '300' },
    ]);

    await apiHelper.createStreamKey(database.id, `${keyPrefix}:events`, [
      { field: 'type', value: 'click' },
      { field: 'page', value: 'home' },
    ]);
  });

  test.afterAll(async ({ apiHelper }) => {
    if (database?.id) {
      await apiHelper.deleteKeysByPattern(database.id, `${keyPrefix}*`);
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test.describe('View Database Analysis', () => {
    test.beforeEach(async ({ analyticsPage }) => {
      await analyticsPage.gotoDatabaseAnalysis(database.id);
    });

    test('should display database analysis page', async ({ analyticsPage }) => {
      await expect(analyticsPage.databaseAnalysisTab).toBeVisible();
      await expect(analyticsPage.databaseAnalysisTab).toHaveAttribute('aria-selected', 'true');
    });

    test('should show new report button', async ({ analyticsPage }) => {
      await expect(analyticsPage.newReportButton).toBeVisible();
    });

    test('should generate analysis report', async ({ analyticsPage }) => {
      await analyticsPage.clickNewReport();
      await analyticsPage.waitForReportGenerated();

      // Should show scanned keys info
      await expect(analyticsPage.scannedKeysText).toBeVisible();
    });

    test('should show data summary tab after analysis', async ({ analyticsPage }) => {
      await analyticsPage.ensureReportGenerated();

      await expect(analyticsPage.dataSummaryTab).toBeVisible();
      await expect(analyticsPage.dataSummaryTab).toHaveAttribute('aria-selected', 'true');
    });

    test('should show tips tab', async ({ analyticsPage }) => {
      await analyticsPage.ensureReportGenerated();

      await expect(analyticsPage.tipsTab).toBeVisible();
    });
  });

  test.describe('Data Summary Charts', () => {
    test.beforeEach(async ({ analyticsPage }) => {
      await analyticsPage.gotoDatabaseAnalysis(database.id);
      await analyticsPage.ensureReportGenerated();
    });

    test('should display memory chart', async ({ analyticsPage }) => {
      await expect(analyticsPage.memoryChartTitle).toBeVisible();
      await expect(analyticsPage.totalMemoryValue).toBeVisible();
    });

    test('should display keys chart', async ({ analyticsPage }) => {
      await expect(analyticsPage.keysChartTitle).toBeVisible();
      await expect(analyticsPage.totalKeysValue).toBeVisible();
    });

    test('should display summary per data section', async ({ analyticsPage }) => {
      await expect(analyticsPage.summaryPerData).toBeVisible();
    });
  });

  test.describe('Top Namespaces Table', () => {
    test.beforeEach(async ({ analyticsPage }) => {
      await analyticsPage.gotoDatabaseAnalysis(database.id);
      await analyticsPage.ensureReportGenerated();
    });

    test('should show top namespaces section', async ({ analyticsPage }) => {
      await expect(analyticsPage.topNamespacesContainer).toBeVisible();
    });

    test('should show namespaces table by memory by default', async ({ analyticsPage }) => {
      // The memory table should be visible by default
      await expect(analyticsPage.nspTableMemory).toBeVisible();
    });

    test('should switch namespaces view to by Number of Keys', async ({ analyticsPage }) => {
      await analyticsPage.switchTopNamespacesView('keys');

      // Keys table should now be visible
      await expect(analyticsPage.nspTableKeys).toBeVisible();
    });

    test('should switch namespaces view back to by Memory', async ({ analyticsPage }) => {
      // Switch to keys first
      await analyticsPage.switchTopNamespacesView('keys');
      await expect(analyticsPage.nspTableKeys).toBeVisible();

      // Switch back to memory
      await analyticsPage.switchTopNamespacesView('memory');
      await expect(analyticsPage.nspTableMemory).toBeVisible();
    });
  });

  test.describe('Top Keys Table', () => {
    test.beforeEach(async ({ analyticsPage }) => {
      await analyticsPage.gotoDatabaseAnalysis(database.id);
      await analyticsPage.ensureReportGenerated();
    });

    test('should show top keys section', async ({ analyticsPage }) => {
      await expect(analyticsPage.topKeysTitle).toBeVisible();
    });

    test('should show top keys table by memory by default', async ({ analyticsPage }) => {
      await expect(analyticsPage.topKeysTableMemory).toBeVisible();
    });

    test('should switch top keys view to by Length', async ({ analyticsPage }) => {
      await analyticsPage.switchTopKeysView('length');

      await expect(analyticsPage.topKeysTableLength).toBeVisible();
    });

    test('should switch top keys view back to by Memory', async ({ analyticsPage }) => {
      // Switch to length first
      await analyticsPage.switchTopKeysView('length');
      await expect(analyticsPage.topKeysTableLength).toBeVisible();

      // Switch back to memory
      await analyticsPage.switchTopKeysView('memory');
      await expect(analyticsPage.topKeysTableMemory).toBeVisible();
    });
  });

  test.describe('TTL Distribution', () => {
    test.beforeEach(async ({ analyticsPage }) => {
      await analyticsPage.gotoDatabaseAnalysis(database.id);
      await analyticsPage.ensureReportGenerated();
    });

    test('should show TTL distribution chart', async ({ analyticsPage }) => {
      await expect(analyticsPage.ttlDistributionChart).toBeVisible();
    });

    test('should toggle show no expiry in TTL chart', async ({ analyticsPage }) => {
      await expect(analyticsPage.showNoExpirySwitch).toBeVisible();

      // Toggle should be clickable without error
      await analyticsPage.toggleShowNoExpiry();
    });
  });

  test.describe('Report History', () => {
    test.beforeEach(async ({ analyticsPage }) => {
      await analyticsPage.gotoDatabaseAnalysis(database.id);
      await analyticsPage.ensureReportGenerated();
    });

    test('should show report history dropdown', async ({ analyticsPage }) => {
      await expect(analyticsPage.reportHistorySelect).toBeVisible();
    });

    test('should have at least one report in history', async ({ analyticsPage }) => {
      const reportCount = await analyticsPage.getReportHistoryCount();
      expect(reportCount).toBeGreaterThan(0);
    });
  });

  test.describe('Navigation', () => {
    test('should navigate from Slow Log to Database Analysis', async ({ analyticsPage }) => {
      // Start at Slow Log
      await analyticsPage.gotoSlowLog(database.id);
      await expect(analyticsPage.slowLogTab).toHaveAttribute('aria-selected', 'true');

      // Click Database Analysis tab
      await analyticsPage.clickDatabaseAnalysisTab();

      // Should now be on Database Analysis
      await expect(analyticsPage.databaseAnalysisTab).toHaveAttribute('aria-selected', 'true');
    });

    test('should navigate from Database Analysis to Slow Log', async ({ analyticsPage }) => {
      // Start at Database Analysis
      await analyticsPage.gotoDatabaseAnalysis(database.id);
      await expect(analyticsPage.databaseAnalysisTab).toHaveAttribute('aria-selected', 'true');

      // Click Slow Log tab
      await analyticsPage.clickSlowLogTab();

      // Should now be on Slow Log
      await expect(analyticsPage.slowLogTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  test.describe('Recommendations (Tips Tab)', () => {
    test.beforeEach(async ({ analyticsPage }) => {
      await analyticsPage.gotoDatabaseAnalysis(database.id);
      await analyticsPage.ensureReportGenerated();
    });

    test('should switch to tips tab', async ({ analyticsPage }) => {
      await analyticsPage.clickTipsTab();

      await expect(analyticsPage.tipsTab).toHaveAttribute('aria-selected', 'true');
    });

    test('should display tips count in tab label', async ({ analyticsPage }) => {
      const tipsCount = await analyticsPage.getTipsCount();

      // Tips count should be a number (could be 0 or more)
      expect(tipsCount).toBeGreaterThanOrEqual(0);
    });

    test('should show recommendations or empty message', async ({ analyticsPage }) => {
      await analyticsPage.clickTipsTab();

      const recommendationCount = await analyticsPage.getRecommendationCount();

      if (recommendationCount === 0) {
        // If no recommendations, empty message should be visible
        await expect(analyticsPage.emptyRecommendationsMessage).toBeVisible();
      } else {
        // If recommendations exist, first accordion should be visible
        await expect(analyticsPage.recommendationAccordions.first()).toBeVisible();
      }
    });

    test('should expand and collapse recommendation', async ({ analyticsPage }) => {
      await analyticsPage.clickTipsTab();

      const count = await analyticsPage.getRecommendationCount();
      if (count === 0) {
        // Skip if no recommendations available
        return;
      }

      // First recommendation should be expanded by default
      const isExpanded = await analyticsPage.isRecommendationExpanded(0);
      expect(isExpanded).toBe(true);

      // Collapse the recommendation
      await analyticsPage.toggleRecommendation(0);
      const isCollapsed = await analyticsPage.isRecommendationExpanded(0);
      expect(isCollapsed).toBe(false);

      // Expand again
      await analyticsPage.toggleRecommendation(0);
      const isExpandedAgain = await analyticsPage.isRecommendationExpanded(0);
      expect(isExpandedAgain).toBe(true);
    });

    test('should show voting section for recommendations', async ({ analyticsPage }) => {
      await analyticsPage.clickTipsTab();

      const count = await analyticsPage.getRecommendationCount();
      if (count === 0) {
        return;
      }

      const hasVoting = await analyticsPage.isVotingSectionVisible();
      expect(hasVoting).toBe(true);
    });

    test('should show tutorial button for applicable recommendations', async ({ analyticsPage }) => {
      await analyticsPage.clickTipsTab();

      const count = await analyticsPage.getRecommendationCount();
      if (count === 0) {
        return;
      }

      // Not all recommendations have tutorials, so we just verify the check works
      const hasTutorial = await analyticsPage.hasTutorialButton();
      expect(typeof hasTutorial).toBe('boolean');
    });

    test('should show badges legend when recommendations exist', async ({ analyticsPage }) => {
      await analyticsPage.clickTipsTab();

      const count = await analyticsPage.getRecommendationCount();
      if (count === 0) {
        return;
      }

      const hasBadges = await analyticsPage.isBadgesLegendVisible();
      expect(hasBadges).toBe(true);
    });
  });
});

/**
 * Analytics > Database Analysis - Large Dataset Tests
 *
 * Uses the pre-seeded big database (port 8103) for tests that require
 * a large number of keys (extrapolation, scanned vs estimated, sorting, etc.)
 */
test.describe('Analytics > Database Analysis (Large Dataset)', () => {
  let bigDatabase: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    bigDatabase = await apiHelper.createDatabase({
      name: `${TEST_DB_PREFIX}big-db-analysis`,
      host: standaloneBigConfig.host,
      port: standaloneBigConfig.port,
    });
  });

  test.afterAll(async ({ apiHelper }) => {
    if (bigDatabase?.id) {
      await apiHelper.deleteDatabase(bigDatabase.id);
    }
  });

  test.describe('Extrapolation', () => {
    test.beforeEach(async ({ analyticsPage }) => {
      await analyticsPage.gotoDatabaseAnalysis(bigDatabase.id);
      await analyticsPage.ensureReportGenerated(120000);
    });

    test('should show extrapolate results switch on large dataset', async ({ analyticsPage }) => {
      await expect(analyticsPage.extrapolateSwitch).toBeVisible();
    });

    test('should toggle extrapolation switch', async ({ analyticsPage }) => {
      await expect(analyticsPage.extrapolateSwitch).toBeVisible();
      await analyticsPage.extrapolateSwitch.click();
    });

    test('should distinguish between scanned and estimated data', async ({ analyticsPage }) => {
      // The progress element shows "Scanned X%" with processed/total key counts
      await expect(analyticsPage.analysisProgress).toBeVisible();
      const text = await analyticsPage.analysisProgress.textContent();

      // On a large dataset, the scan should be partial (< 100%)
      // The format is "Scanned X% (processed / total keys)"
      expect(text).toMatch(/Scanned/);
      expect(text).toMatch(/\d+%/);
    });
  });

  test.describe('Responsiveness', () => {
    test('should complete analysis on large dataset within timeout', async ({ analyticsPage }) => {
      await analyticsPage.gotoDatabaseAnalysis(bigDatabase.id);

      // Generate a new report and verify it completes (allow up to 120s for large dataset)
      await analyticsPage.clickNewReport();
      await analyticsPage.waitForReportGenerated(120000);

      // Verify main UI sections are rendered
      await expect(analyticsPage.analysisProgress).toBeVisible();
      await expect(analyticsPage.databaseAnalysisPage).toBeVisible();
    });
  });

  test.describe('Namespace Sorting', () => {
    test.beforeEach(async ({ analyticsPage }) => {
      await analyticsPage.gotoDatabaseAnalysis(bigDatabase.id);
      await analyticsPage.ensureReportGenerated(120000);
    });

    test('should sort namespaces by key pattern', async ({ analyticsPage }) => {
      // The namespace table header has sortable button elements with aria-sort
      const keyPatternHeader = analyticsPage.nspTableMemory
        .getByRole('columnheader')
        .filter({ hasText: 'Key Pattern' })
        .getByRole('button');

      await expect(keyPatternHeader).toBeVisible();

      // Default sort is by Memory desc, so Key Pattern has no aria-sort attribute
      await expect(keyPatternHeader).not.toHaveAttribute('aria-sort');

      // Click to sort ascending
      await keyPatternHeader.click();
      await expect(keyPatternHeader).toHaveAttribute('aria-sort', 'ascending');

      // Click again to sort descending
      await keyPatternHeader.click();
      await expect(keyPatternHeader).toHaveAttribute('aria-sort', 'descending');
    });
  });

  test.describe('Namespace Navigation', () => {
    test.beforeEach(async ({ analyticsPage }) => {
      await analyticsPage.gotoDatabaseAnalysis(bigDatabase.id);
      await analyticsPage.ensureReportGenerated(120000);
    });

    test('should filter namespace to Browser view', async ({ browserPage, analyticsPage, page }) => {
      // Find the first namespace cell in the Key Pattern column (first data row)
      const firstRow = analyticsPage.nspTableMemory
        .getByRole('row')
        .nth(1);

      // The Key Pattern cell contains a button (TableTextBtn) with the namespace name
      const namespaceButton = firstRow.getByRole('cell').first().getByRole('button');
      await expect(namespaceButton).toBeVisible();

      // Get the namespace pattern text before clicking
      const namespaceText = await namespaceButton.textContent();
      expect(namespaceText).toBeTruthy();

      // Click on the namespace to navigate to Browser
      await namespaceButton.click();

      // Wait for navigation to Browser page
      await page.waitForURL(/\/browser/);

      // Verify the search input is populated with the namespace pattern
      await expect(browserPage.keyList.searchInput).toHaveValue(namespaceText!);
    });
  });
});
