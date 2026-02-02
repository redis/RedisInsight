import { Page, Locator } from '@playwright/test';

/**
 * CLI Panel component
 * Handles the CLI panel at the bottom of the page
 */
export class CliPanel {
  readonly page: Page;
  readonly container: Locator;
  readonly expandButton: Locator;
  readonly hideButton: Locator;
  readonly closeButton: Locator;
  readonly commandInput: Locator;
  readonly cliTextbox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId('cli').first();
    this.expandButton = page.getByTestId('expand-cli');
    this.hideButton = page.getByTestId('hide-cli');
    this.closeButton = page.getByTestId('close-cli');
    this.commandInput = page.getByTestId('cli-command');
    // The CLI uses a custom textbox container
    this.cliTextbox = this.container.locator('[role="textbox"]');
  }

  /**
   * Open the CLI panel
   */
  async open(): Promise<void> {
    const isVisible = await this.hideButton.isVisible();
    if (!isVisible) {
      await this.expandButton.click();
      await this.hideButton.waitFor({ state: 'visible' });
    }
  }

  /**
   * Close the CLI panel
   */
  async close(): Promise<void> {
    const isVisible = await this.closeButton.isVisible();
    if (isVisible) {
      await this.closeButton.click();
    }
  }

  /**
   * Hide the CLI panel (minimize)
   */
  async hide(): Promise<void> {
    const isVisible = await this.hideButton.isVisible();
    if (isVisible) {
      await this.hideButton.click();
    }
  }

  /**
   * Check if CLI panel is open
   */
  async isOpen(): Promise<boolean> {
    return this.hideButton.isVisible();
  }

  /**
   * Execute a command in the CLI
   */
  async executeCommand(command: string): Promise<void> {
    await this.commandInput.focus();
    await this.page.keyboard.type(command);
    await this.page.keyboard.press('Enter');
  }

  /**
   * Type a command in the CLI without executing it
   * This triggers the Command Helper integration
   */
  async typeCommand(command: string): Promise<void> {
    await this.commandInput.focus();
    // Type the command character by character to trigger updates
    await this.page.keyboard.type(command, { delay: 50 });
  }

  /**
   * Clear the current command input
   */
  async clearInput(): Promise<void> {
    await this.commandInput.focus();
    // Select all and delete
    await this.page.keyboard.press('Control+a');
    await this.page.keyboard.press('Backspace');
  }

  /**
   * Get the CLI output text
   */
  async getOutput(): Promise<string> {
    return this.container.innerText();
  }

  /**
   * Check if output contains specific text
   */
  async outputContains(text: string): Promise<boolean> {
    const output = await this.getOutput();
    return output.includes(text);
  }

  /**
   * Wait for specific text in output
   */
  async waitForOutput(text: string, timeout = 5000): Promise<void> {
    await this.page.waitForFunction(
      ({ selector, expectedText }) => {
        const element = document.querySelector(selector);
        return element?.textContent?.includes(expectedText);
      },
      { selector: '[data-testid="cli"]', expectedText: text },
      { timeout },
    );
  }

  /**
   * Clear the CLI (if supported)
   */
  async clear(): Promise<void> {
    await this.executeCommand('CLEAR');
  }
}
