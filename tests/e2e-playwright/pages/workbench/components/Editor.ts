import { Page, Locator } from '@playwright/test';

/**
 * Editor component for Workbench
 * Handles the Monaco editor for entering Redis commands
 */
export class Editor {
  readonly page: Page;
  readonly container: Locator;
  readonly textbox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId('main-input-container-area');
    this.textbox = page.getByRole('textbox', { name: /Editor content/i });
  }

  /**
   * Wait for editor to be ready
   */
  async waitForEditor(): Promise<void> {
    await this.container.waitFor({ state: 'visible' });
  }

  /**
   * Set command in the editor
   */
  async setCommand(command: string): Promise<void> {
    await this.container.click();
    await this.textbox.fill(command);
  }

  /**
   * Get current command from editor
   */
  async getCommand(): Promise<string> {
    return this.textbox.inputValue();
  }

  /**
   * Clear the editor
   */
  async clear(): Promise<void> {
    await this.container.click();
    await this.textbox.fill('');
  }

  /**
   * Append command to existing content
   */
  async appendCommand(command: string): Promise<void> {
    await this.container.click();
    const currentValue = await this.getCommand();
    const newValue = currentValue ? `${currentValue}\n${command}` : command;
    await this.textbox.fill(newValue);
  }

  /**
   * Check if editor is visible
   */
  async isVisible(): Promise<boolean> {
    return this.container.isVisible();
  }
}

