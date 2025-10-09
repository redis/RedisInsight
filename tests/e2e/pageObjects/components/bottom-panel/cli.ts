import { Selector, t } from 'testcafe';
import { Common } from '../../../helpers/common';

export class Cli {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //BUTTONS
    cliExpandButton = Selector('[data-testid=expand-cli]');
    cliCollapseButton = Selector('[data-testid=close-cli]');
    minimizeCliButton = Selector('[data-testid=hide-cli]');

    cliBadge = Selector('[data-testid=expand-cli] div');

    cliResizeButton = Selector('[data-test-subj=resize-btn-browser-cli]');
    workbenchLink = Selector('[data-test-subj=cli-workbench-page-btn]');

    //TEXT INPUTS (also referred to as 'Text fields')
    cliCommandInput = Selector('[data-testid=cli-command]');
    cliArea = Selector('[data-testid=cli');

    cliOutputResponseSuccess = Selector('[data-testid=cli-output-response-success]');
    cliOutputResponseFail = Selector('[data-testid=cli-output-response-fail]');

    cliCommandAutocomplete = Selector('[data-testid=cli-command-autocomplete]');
    cliCommandExecuted = Selector('[data-testid=cli-command-wrapper]');
    cliReadMoreJSONCommandDocumentation = Selector('[id=jsonset]');
    cliReadMoreRediSearchCommandDocumentation = Selector('[id=ftexplain]');

    cliEndpoint = Selector('[data-testid^=cli-endpoint]');
    cliDbIndex = Selector('[data-testid=cli-db-index]');
    cliWarningMessage = Selector('[class*=euiTextColor--danger]');
    cliLinkToPubSub = Selector('[data-test-subj=pubsub-page-btn]');
    // Panel
    cliPanel = Selector('[data-testid=cli]');

    /**
     * Add keys from CLI
     * @param keyCommand The command from cli to add key
     * @param amount The amount of the keys
     * @param keyName The name of the keys. The default value is keyName
     */
    async addKeysFromCli(keyCommand: string, amount: number, keyName = 'keyName'): Promise<void> {
        const keyValueArray = await Common.createArrayWithKeyValueAndKeyname(amount, keyName);

        // Open CLI
        await t.click(this.cliExpandButton);
        // Add keys
        await t.typeText(this.cliCommandInput, `${keyCommand} ${keyValueArray.join(' ')}`, { replace: true, paste: true });
        await t.pressKey('enter');
        await t.click(this.cliCollapseButton);
    }

    /**
     * Add keys from CLI with delimiter
     * @param keyCommand The command from cli to add key
     * @param amount The amount of the keys
     */
    async addKeysFromCliWithDelimiter(keyCommand: string, amount: number): Promise<void> {
        //Open CLI
        await t.click(this.cliExpandButton);
        //Add keys
        const keyValueArray = await Common.createArrayWithKeyValueAndDelimiter(amount);
        await t.typeText(this.cliCommandInput, `${keyCommand} ${keyValueArray.join(' ')}`, { replace: true, paste: true });
        await t.pressKey('enter');
        await t.click(this.cliCollapseButton);
    }

    /**
     * Delete keys from CLI with delimiter
     * @param amount The amount of the keys
     */
    async deleteKeysFromCliWithDelimiter(amount: number): Promise<void> {
        //Open CLI
        await t.click(this.cliExpandButton);
        //Add keys
        const keyValueArray = await Common.createArrayWithKeyAndDelimiter(amount);
        await t.typeText(this.cliCommandInput, `DEL ${keyValueArray.join(' ')}`, { replace: true, paste: true });
        await t.pressKey('enter');
        await t.click(this.cliCollapseButton);
    }

    /**
     * Send command in Cli
     * @param command The command to send
     */
    async sendCommandInCli(command: string): Promise<void> {
        // Open CLI
        await t.click(this.cliExpandButton);
        await t.typeText(this.cliCommandInput, command, { replace: true, paste: true });
        await t.pressKey('enter');
        await t.click(this.cliCollapseButton);
    }

    /**
     * Send command in Cli
     * @param commands The commands to send
     */
    async sendCommandsInCli(commands: string[]): Promise<void> {
        await t.click(this.cliExpandButton);
        for (const command of commands) {
            await t.typeText(this.cliCommandInput, command, { replace: true, paste: true });
            await t.pressKey('enter');
        }
        await t.click(this.cliCollapseButton);
    }

    /**
     * Get command result execution
     * @param command The command for send in CLI
     */
    async getSuccessCommandResultFromCli(command: string): Promise<string> {
        // Open CLI
        await t.click(this.cliExpandButton);
        // Add keys
        await t.typeText(this.cliCommandInput, command, { replace: true, paste: true });
        await t.pressKey('enter');
        const commandResult = await this.cliOutputResponseSuccess.innerText;
        await t.click(this.cliCollapseButton);
        return commandResult;
    }

    /**
     * Send command in Cli and wait for total keys after 5 seconds
     * @param command The command to send
     */
    async sendCliCommandAndWaitForTotalKeys(command: string): Promise<void> {
        await this.sendCommandInCli(command);
        // Wait 5 seconds and return total keys
        await t.wait(5000);
    }

    /**
     *  Create random index name with CLI and return
     */

    async createIndexwithCLI(prefix: string): Promise<string> {
        const word = Common.generateWord(10);
        const index = `idx:${word}`;
        const commands = [
            `FT.CREATE ${index} ON HASH PREFIX 1 ${prefix} SCHEMA "name" TEXT`
        ];
        await this.sendCommandsInCli(commands);
        return index;
    }

    /**
     * Add cached scripts
     * @param numberOfScripts The number of cached scripts to add
     */
    async addCachedScripts(numberOfScripts: number): Promise<void> {
        const scripts: string[] = [];

        for (let i = 0; i < numberOfScripts; i++) {
            scripts.push(`EVAL "return '${Common.generateWord(3)}'" 0`);
        }

        await this.sendCommandsInCli(scripts);
    }

    /**
     * Get warning message text by command
     * @param command command name
     */
    async getWarningMessageText(command: string): Promise<string> {

        const executedCommand = await this.cliCommandExecuted.withExactText(command);
        return await executedCommand.nextSibling(0).textContent;
    }

    /**
     * Get executed text by index
     * @param index index of the command in the CLI, by default is the last one
     */
    async getExecutedCommandTextByIndex(index = -1): Promise<string> {
        return await this.cliCommandExecuted.nth(index).textContent;
    }
}
