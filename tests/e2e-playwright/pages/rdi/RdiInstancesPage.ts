import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page Object for the RDI instances list (home page, "Redis Data Integration" tab)
 */
export class RdiInstancesPage extends BasePage {
  readonly rdiTab: Locator;
  readonly instancesList: Locator;

  constructor(page: Page) {
    super(page);
    this.rdiTab = this.homeTabs.getByRole('tab', { name: 'Redis Data Integration' });
    this.instancesList = page.getByTestId('rdi-instance-list');
  }

  /**
   * Open the RDI instances list from the home page
   */
  async goto(): Promise<void> {
    await this.gotoHome();
    await this.rdiTab.click();
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    await this.instancesList.waitFor({ state: 'visible' });
  }

  /**
   * The row of an RDI instance in the list
   */
  getInstanceRow(rdiInstanceId: string): Locator {
    return this.page.getByTestId(new RegExp(`^rdi-list-cell-${rdiInstanceId}-`)).first();
  }

  /**
   * Click an RDI instance, which connects to it and opens its pipelines
   */
  async openInstance(rdiInstanceId: string): Promise<void> {
    await this.getInstanceRow(rdiInstanceId).click();
  }
}
