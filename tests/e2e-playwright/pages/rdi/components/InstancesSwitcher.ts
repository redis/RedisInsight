import { Page, Locator } from '@playwright/test';

/**
 * The instance switcher popover the breadcrumb chevron opens: tabs for Redis
 * databases and RDI instances, and the instances of the selected tab
 */
export class InstancesSwitcher {
  readonly page: Page;

  readonly popover: Locator;
  readonly rdiTab: Locator;
  readonly databasesTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.rdiTab = page.getByRole('tab', { name: /^Redis Data Integration \(\d+\)$/ });
    this.databasesTab = page.getByRole('tab', { name: /^Databases \(\d+\)$/ });
    this.popover = page.getByRole('dialog').filter({ has: this.rdiTab });
  }

  getInstance(name: string): Locator {
    return this.popover.getByRole('button', { name, exact: true });
  }
}
