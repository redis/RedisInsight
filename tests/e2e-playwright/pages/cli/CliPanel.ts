import { Page, Locator, expect } from '@playwright/test';

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
  readonly successOutput: Locator;
  readonly errorOutput: Locator;
  readonly commandWrapper: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId('cli').first();
    this.expandButton = page.getByTestId('expand-cli');
    this.hideButton = page.getByTestId('hide-cli');
    this.closeButton = page.getByTestId('close-cli');
    this.commandInput = page.getByTestId('cli-command');
    // The CLI uses a custom textbox container
    this.cliTextbox = this.container.locator('[role="textbox"]');
    this.successOutput = page.getByTestId('cli-output-response-success');
    this.errorOutput = page.getByTestId('cli-output-response-fail');
    this.commandWrapper = page.getByTestId('cli-command-wrapper');
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
   * Execute a command and wait for a success response to appear
   */
  async executeCommandAndWait(command: string): Promise<void> {
    const countBefore = await this.successOutput.count();
    await this.executeCommand(command);
    await expect(this.successOutput.nth(countBefore)).toBeVisible();
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
   * Get the current text in the command input (ContentEditable)
   */
  async getInputText(): Promise<string> {
    return this.commandInput.innerText();
  }

  /**
   * Get the CLI output text
   */
  async getOutput(): Promise<string> {
    return this.container.innerText();
  }

  /**
   * Get the text of the last error response
   */
  async getLastErrorResponse(): Promise<string> {
    const count = await this.errorOutput.count();
    if (count === 0) return '';
    return this.errorOutput.nth(count - 1).innerText();
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
   * Press ArrowUp to navigate command history (older)
   */
  async pressArrowUp(): Promise<void> {
    await this.commandInput.focus();
    await this.page.keyboard.press('ArrowUp');
  }

  /**
   * Press ArrowDown to navigate command history (newer)
   */
  async pressArrowDown(): Promise<void> {
    await this.commandInput.focus();
    await this.page.keyboard.press('ArrowDown');
  }

  /**
   * Press Tab to trigger command completion
   */
  async pressTab(): Promise<void> {
    await this.commandInput.focus();
    await this.page.keyboard.press('Tab');
  }

  /**
   * Clear the CLI output
   */
  async clear(): Promise<void> {
    await this.executeCommand('CLEAR');
  }
}
