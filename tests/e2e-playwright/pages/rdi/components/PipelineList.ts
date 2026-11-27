import { Page, Locator } from '@playwright/test';

/**
 * rdi-ui's list of an RDI instance's pipelines, with their status, sources and target
 */
export class PipelineList {
  readonly page: Page;

  readonly table: Locator;
  readonly pipelineNameColumnHeader: Locator;
  readonly addPipelineButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.table = page.getByTestId('pipeline-management-v2-page').getByRole('table');
    this.pipelineNameColumnHeader = this.table.getByRole('columnheader', { name: 'Pipeline name' });
    this.addPipelineButton = page.getByRole('button', { name: 'Add pipeline' });
  }

  async waitForLoad(): Promise<void> {
    await this.table.waitFor({ state: 'visible' });
  }

  getRow(pipelineName: string): Locator {
    return this.table
      .getByRole('row')
      .filter({ has: this.page.getByRole('cell', { name: pipelineName, exact: true }) });
  }

  async openPipeline(pipelineName: string): Promise<void> {
    await this.getRow(pipelineName).getByRole('cell', { name: pipelineName, exact: true }).click();
  }

  /**
   * Open a pipeline's row menu (View, Start/Stop, Reset, Flush target, Delete)
   */
  async openRowActions(pipelineName: string): Promise<void> {
    await this.page.getByRole('button', { name: `Actions for ${pipelineName}` }).click();
  }

  getRowAction(pipelineName: string, action: string): Locator {
    return this.page.getByRole('menu', { name: `Actions for ${pipelineName}` }).getByRole('menuitem', { name: action });
  }

  /**
   * Relative luminance (0 = black, 1 = white) of the list's column header
   * text. rdi-ui draws its own theme, so this tells whether it renders light
   * (dark text) or dark (light text).
   */
  async getHeaderTextLuminance(): Promise<number> {
    const color = await this.pipelineNameColumnHeader.evaluate((element) => getComputedStyle(element).color);
    const [red, green, blue] = (color.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map((channel) => {
      const value = Number(channel) / 255;
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  }
}
