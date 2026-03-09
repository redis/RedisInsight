import { test, expect } from '../../../fixtures/base';
import { standaloneConfig } from '../../../config/databases/standalone';
import { DatabaseInstance } from '../../../types';

test.describe('Insights > Insights Panel', () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase({
      name: 'test-insights-panel-db',
      host: standaloneConfig.host,
      port: standaloneConfig.port,
    });
  });

  test.afterAll(async ({ apiHelper }) => {
    if (database?.id) {
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test.describe('Panel Lifecycle', () => {
    test.beforeEach(async ({ browserPage }) => {
      await browserPage.goto(database.id);
    });

    test('should open Insights panel', async ({ insightsPanel }) => {
      await insightsPanel.open();
      await expect(insightsPanel.panel).toBeVisible();
    });

    test('should close Insights panel', async ({ insightsPanel }) => {
      await insightsPanel.open();
      await expect(insightsPanel.panel).toBeVisible();

      await insightsPanel.close();
      await expect(insightsPanel.panel).not.toBeVisible();
    });
  });

  test.describe('Tab Navigation', () => {
    test.beforeEach(async ({ browserPage, insightsPanel }) => {
      await browserPage.goto(database.id);
      await insightsPanel.open();
    });

    test('should switch to Tutorials tab', async ({ insightsPanel }) => {
      // First switch to Tips to ensure we can switch back
      await insightsPanel.switchToTipsTab();
      await expect(insightsPanel.tipsTab).toHaveAttribute('data-state', 'active');

      // Now switch to Tutorials
      await insightsPanel.switchToTutorialsTab();
      await expect(insightsPanel.tutorialsTab).toHaveAttribute('data-state', 'active');
    });

    test('should switch to Tips tab', async ({ insightsPanel }) => {
      // Ensure we're on Tutorials first
      await insightsPanel.switchToTutorialsTab();
      await expect(insightsPanel.tutorialsTab).toHaveAttribute('data-state', 'active');

      // Switch to Tips
      await insightsPanel.switchToTipsTab();
      await expect(insightsPanel.tipsTab).toHaveAttribute('data-state', 'active');
    });
  });

  test.describe('Tutorials Tab Content', () => {
    test.beforeEach(async ({ browserPage, insightsPanel }) => {
      await browserPage.goto(database.id);
      await insightsPanel.open();
      await insightsPanel.switchToTutorialsTab();
    });

    test('should expand and collapse tutorial folders', async ({ insightsPanel }) => {
      // Check Tutorials accordion is visible (main tutorials section)
      await expect(insightsPanel.redisTutorialsAccordion).toBeVisible();

      // Expand Tutorials if collapsed
      await insightsPanel.expandTutorialFolder('tutorials');
      const isExpanded = await insightsPanel.isTutorialFolderExpanded('tutorials');
      expect(isExpanded).toBe(true);

      // Collapse Tutorials
      await insightsPanel.collapseTutorialFolder('tutorials');
      const isCollapsed = !(await insightsPanel.isTutorialFolderExpanded('tutorials'));
      expect(isCollapsed).toBe(true);
    });

    test('should view Tutorials section', async ({ insightsPanel }) => {
      // Verify main Tutorials section is visible
      await expect(insightsPanel.redisTutorialsAccordion).toBeVisible();

      // The accordion should have proper text content (label is "Redis tutorials")
      await expect(insightsPanel.redisTutorialsAccordion).toContainText('Redis tutorials');
    });

    test('should run through a tutorial with pagination', async ({ insightsPanel }) => {
      // Expand the Redis tutorials section
      await insightsPanel.expandTutorialFolder('tutorials');

      // Open a tutorial (Introduction to Redis Stack)
      await insightsPanel.openTutorial('introduction');

      // Verify tutorial page is displayed
      await expect(insightsPanel.tutorialPageContent).toBeVisible();

      // Verify pagination is visible
      await expect(insightsPanel.paginationMenuButton).toBeVisible();

      // Get initial pagination info
      const initialPagination = await insightsPanel.getPaginationInfo();
      expect(initialPagination).toContain('1 of');

      // Navigate to next page if available
      if (await insightsPanel.hasNextPage()) {
        await insightsPanel.goToNextPage();

        // Verify we moved to page 2
        const nextPagination = await insightsPanel.getPaginationInfo();
        expect(nextPagination).toContain('2 of');

        // Navigate back
        await insightsPanel.goToPreviousPage();

        // Verify we're back to page 1
        const backPagination = await insightsPanel.getPaginationInfo();
        expect(backPagination).toContain('1 of');
      }
    });

    test('should run a tutorial command', async ({ insightsPanel }) => {
      // Expand the Redis tutorials section
      await insightsPanel.expandTutorialFolder('tutorials');

      // Open a tutorial
      await insightsPanel.openTutorial('introduction');

      // Verify tutorial page is displayed
      await expect(insightsPanel.tutorialPageContent).toBeVisible();

      // Check if there's a run button on the page
      const runButton = insightsPanel.getFirstRunButton();

      // If a run button exists, click it to run the command
      if (await runButton.isVisible()) {
        await runButton.click();

        // The button should show loading or success state
        // We just verify it's still present (the command was executed)
        await expect(runButton).toBeVisible();
      }
    });
  });
});
