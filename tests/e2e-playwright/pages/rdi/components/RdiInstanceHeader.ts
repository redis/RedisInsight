import { Page, Locator } from '@playwright/test';

/**
 * RedisInsight's RDI instance header, with the breadcrumb
 * `Data integration / <instance> ▾ / <pipeline>`.
 *
 * On the v2 pipeline page this is the only breadcrumb: rdi-ui's own one is
 * hidden, and its links run through rdi-ui's unsaved-changes check.
 */
export class RdiInstanceHeader {
  readonly page: Page;

  readonly breadcrumbs: Locator;
  /** "Data integration": leaves to the RDI instances list */
  readonly dataIntegrationLink: Locator;
  /** The instance name as a link of its own, shown while a pipeline is open. It returns to the pipeline list. */
  readonly instanceNameLink: Locator;
  /** The chevron next to the instance name, which opens the instance switcher */
  readonly switchInstanceButton: Locator;
  /** The open pipeline's name, last in the breadcrumb */
  readonly pipelineName: Locator;

  constructor(page: Page) {
    this.page = page;
    this.breadcrumbs = page.getByTestId('breadcrumbs-container');
    this.dataIntegrationLink = page.getByTestId('my-rdi-instances-btn');
    this.instanceNameLink = page.getByTestId('nav-instance-name-link');
    this.switchInstanceButton = page.getByTestId('nav-instance-popover-btn');
    this.pipelineName = page.getByTestId('rdi-pipeline-name');
  }

  /**
   * Every "Data integration" breadcrumb on the page: RedisInsight's, plus
   * rdi-ui's if it were not hidden
   */
  getDataIntegrationCrumbs(): Locator {
    return this.page.getByText('Data integration', { exact: true });
  }

  getInstanceName(name: string): Locator {
    return this.breadcrumbs.getByText(name, { exact: true });
  }
}
