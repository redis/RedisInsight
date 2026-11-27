import { Page, Locator } from '@playwright/test';

/**
 * rdi-ui's view of an open, deployed pipeline: the Dashboard, Metrics,
 * Settings, Configuration, Dataset and Transformations tabs
 */
export class PipelineView {
  readonly page: Page;

  readonly tabs: Locator;
  readonly dashboardTab: Locator;
  readonly settingsTab: Locator;
  readonly configurationTab: Locator;

  /** Turns the current tab into an editable form */
  readonly editButton: Locator;
  readonly saveChangesButton: Locator;
  readonly discardChangesButton: Locator;

  // Dashboard
  readonly addSourceButton: Locator;

  // Settings
  readonly hashDataStructureRadio: Locator;
  readonly jsonDataStructureRadio: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tabs = page.getByTestId('pipeline-management-v2-page').getByRole('tablist');
    this.dashboardTab = page.getByRole('tab', { name: 'Dashboard' });
    this.settingsTab = page.getByRole('tab', { name: 'Settings' });
    this.configurationTab = page.getByRole('tab', { name: 'Configuration' });

    this.editButton = page.getByRole('button', { name: 'Edit', exact: true });
    this.saveChangesButton = page.getByRole('button', { name: 'Save changes' });
    this.discardChangesButton = page.getByRole('button', { name: 'Discard changes' });

    this.addSourceButton = page.getByRole('button', { name: 'Add source', exact: true });

    this.hashDataStructureRadio = page.getByRole('radio', { name: 'Hash' });
    this.jsonDataStructureRadio = page.getByRole('radio', { name: 'JSON' });
  }

  async waitForLoad(): Promise<void> {
    await this.dashboardTab.waitFor({ state: 'visible' });
  }

  /**
   * Leave the pipeline with an unsaved change: edit Settings and switch the
   * default data structure from Hash to JSON, without saving
   */
  async makeUnsavedSettingsChange(): Promise<void> {
    await this.settingsTab.click();
    await this.editButton.click();
    await this.jsonDataStructureRadio.check();
  }
}
