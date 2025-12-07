import { test, expect } from '../../fixtures/base';
import { Tags } from '../../config';
import { getStandaloneConfig } from '../../test-data/databases';
import { WorkbenchPage } from '../../pages';

/**
 * Workbench > Profiler Tests
 *
 * Tests for the Profiler panel functionality
 */
test.describe.serial('Workbench > Profiler', () => {
  let databaseId: string;
  let workbenchPage: WorkbenchPage;

  test.beforeAll(async ({ apiHelper }) => {
    const config = getStandaloneConfig({ name: 'test-profiler-db' });
    const db = await apiHelper.createDatabase(config);
    databaseId = db.id;
  });

  test.afterAll(async ({ apiHelper }) => {
    if (databaseId) {
      await apiHelper.deleteDatabase(databaseId);
    }
  });

  test.beforeEach(async ({ page, createWorkbenchPage }) => {
    workbenchPage = createWorkbenchPage(databaseId);
    // Navigate to the database first
    await page.goto(`/${databaseId}/workbench`);
    await workbenchPage.waitForLoad();
  });

  test(`should open profiler panel ${Tags.SMOKE}`, async () => {
    // Open profiler panel
    await workbenchPage.profilerPanel.open();

    // Verify profiler panel is visible
    const isVisible = await workbenchPage.profilerPanel.isVisible();
    expect(isVisible).toBe(true);
  });

  test(`should show profiler warning message ${Tags.REGRESSION}`, async () => {
    await workbenchPage.profilerPanel.open();

    // Verify warning message is visible
    const isWarningVisible = await workbenchPage.profilerPanel.isWarningVisible();
    expect(isWarningVisible).toBe(true);
  });

  test(`should start profiler ${Tags.CRITICAL}`, async () => {
    await workbenchPage.profilerPanel.open();

    // Start profiler
    await workbenchPage.profilerPanel.start();

    // Verify profiler is running
    const isRunning = await workbenchPage.profilerPanel.isRunning();
    expect(isRunning).toBe(true);
  });

  test(`should stop profiler ${Tags.CRITICAL}`, async () => {
    await workbenchPage.profilerPanel.open();

    // Start profiler first
    await workbenchPage.profilerPanel.start();

    // Wait a moment for some commands to be captured
    await workbenchPage.page.waitForTimeout(1000);

    // Stop profiler
    await workbenchPage.profilerPanel.stop();

    // Verify profiler is stopped (running time text should be visible)
    await expect(workbenchPage.profilerPanel.runningTimeText).toBeVisible();
  });

  test(`should show reset button after stopping ${Tags.REGRESSION}`, async () => {
    await workbenchPage.profilerPanel.open();

    // Start and stop profiler
    await workbenchPage.profilerPanel.start();
    await workbenchPage.page.waitForTimeout(500);
    await workbenchPage.profilerPanel.stop();

    // Verify reset button is visible
    await expect(workbenchPage.profilerPanel.resetButton).toBeVisible();
  });

  test(`should reset profiler ${Tags.REGRESSION}`, async () => {
    await workbenchPage.profilerPanel.open();

    // Start and stop profiler
    await workbenchPage.profilerPanel.start();
    await workbenchPage.page.waitForTimeout(500);
    await workbenchPage.profilerPanel.stop();

    // Reset profiler
    await workbenchPage.profilerPanel.reset();

    // Verify start button is visible again (profiler is reset)
    await expect(workbenchPage.profilerPanel.startButton).toBeVisible();
  });

  test(`should hide profiler panel ${Tags.REGRESSION}`, async () => {
    await workbenchPage.profilerPanel.open();

    // Hide profiler panel
    await workbenchPage.profilerPanel.hide();

    // Verify profiler panel is hidden (start button not visible)
    await expect(workbenchPage.profilerPanel.startButton).not.toBeVisible();
  });

  test(`should close profiler panel ${Tags.REGRESSION}`, async () => {
    await workbenchPage.profilerPanel.open();

    // Close profiler panel
    await workbenchPage.profilerPanel.close();

    // Verify profiler panel is closed
    await expect(workbenchPage.profilerPanel.startButton).not.toBeVisible();
  });

  test(`should toggle save log switch ${Tags.REGRESSION}`, async () => {
    await workbenchPage.profilerPanel.open();

    // Verify save log switch is visible
    await expect(workbenchPage.profilerPanel.saveLogSwitch).toBeVisible();

    // Get initial state
    const initialState = await workbenchPage.profilerPanel.saveLogSwitch.isChecked();

    // Toggle save log
    await workbenchPage.profilerPanel.toggleSaveLog();

    // Verify state changed
    const newState = await workbenchPage.profilerPanel.saveLogSwitch.isChecked();
    expect(newState).toBe(!initialState);
  });
});

