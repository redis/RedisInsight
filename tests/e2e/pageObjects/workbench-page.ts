import { Selector, t } from 'testcafe';
import { InstancePage } from './instance-page';
import { Common } from '../helpers/common';

export class WorkbenchPage extends InstancePage {
    //CSS selectors
    cssSelectorPaginationButtonPrevious = '[data-test-subj=pagination-button-previous]';
    cssSelectorPaginationButtonNext = '[data-test-subj=pagination-button-next]';
    cssMonacoCommandPaletteLine = '[aria-label="Command Palette"]';
    cssWorkbenchCommandInHistory = '[data-testid=wb-command]';
    queryGraphContainer = '[data-testid=query-graph-container]';
    cssQueryCardCommand = '[data-testid=query-card-command]';
    cssRowInVirtualizedTable = '[data-testid^=row-]';
    cssClientListViewTypeOption = '[data-testid=view-type-selected-Plugin-client-list__clients-list]';
    cssQueryCardContainer = '[data-testid^="query-card-container-"]';
    cssQueryTextResult = '[data-testid=query-cli-result]';
    cssReRunCommandButton = '[data-testid=re-run-command]';
    cssDeleteCommandButton = '[data-testid=delete-command]';
    cssJsonViewTypeOption = '[data-testid=view-type-selected-Plugin-client-list__json-view]';
    cssQueryTableResult = '[data-testid^=query-table-result-]';
    cssTableViewTypeOption = '[data-testid=view-type-selected-Plugin-redisearch__redisearch]';
    cssCommandExecutionDateTime = '[data-testid=command-execution-date-time]';
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //BUTTON
    submitCommandButton = Selector('[data-testid=btn-submit]');
    queryInput = Selector('[data-testid=query-input-container]');
    queryInputForText = Selector('[data-testid=query-input-container] .view-lines');
    resizeButtonForScriptingAndResults = Selector('[data-test-subj=resize-btn-scripting-area-and-results]');
    paginationButtonPrevious = Selector(this.cssSelectorPaginationButtonPrevious);
    paginationButtonNext = Selector(this.cssSelectorPaginationButtonNext);
    preselectButtons = Selector('[data-testid^=preselect-]');
    preselectManual = Selector('[data-testid=preselect-Manual]');
    queryCardNoModuleButton = Selector('[data-testid=query-card-no-module-button] a');
    groupMode = Selector('[data-testid=btn-change-group-mode]');
    runButtonToolTip = Selector('[data-testid=run-query-tooltip]');
    loadedCommand = Selector('[class=euiLoadingContent__singleLine]');
    runButtonSpinner = Selector('[data-testid=loading-spinner]');
    commandExecutionDateAndTime = Selector('[data-testid=command-execution-date-time]');
    executionCommandTime = Selector('[data-testid=command-execution-time-value]');
    executionCommandIcon = Selector('[data-testid=command-execution-time-icon]');
    executedCommandTitle = Selector('[data-testid=query-card-tooltip-anchor]', { timeout: 1500 });
    queryResult = Selector('[data-testid=query-common-result]');
    queryInputScriptArea = Selector('[data-testid=query-input-container] .view-line');
    parametersAnchor = Selector('[data-testid=parameters-anchor]');
    clearResultsBtn = Selector('[data-testid=clear-history-btn]');

    // OVERLAY/LOADING ELEMENTS
    // Selector for the problematic overlay that obstructs workbench interactions in CI
    overlayContainer = Selector('.RI-flex-group.RI-flex-row').filter((node) => {
        const style = node.getAttribute('style');
        return !!(style && style.includes('height: 100%'));
    });

    //ICONS
    noCommandHistoryIcon = Selector('[data-testid=wb_no-results__icon]');
    groupModeIcon = Selector('[data-testid=group-mode-tooltip]');
    silentModeIcon = Selector('[data-testid=silent-mode-tooltip]');
    rawModeIcon = Selector('[data-testid=raw-mode-tooltip]');

    //TEXT ELEMENTS
    responseInfo = Selector('[class="responseInfo"]');
    parsedRedisReply = Selector('[class="parsedRedisReply"]');
    mainEditorArea = Selector('[data-testid=main-input-container-area]');
    queryColumns = Selector('[data-testid*=query-column-]');
    noCommandHistorySection = Selector('[data-testid=wb_no-results]');
    noCommandHistoryTitle = Selector('[data-testid=wb_no-results__title]');
    noCommandHistoryText = Selector('[data-testid=wb_no-results__summary]');
    scrolledEnablementArea = Selector('[data-testid=enablement-area__page]');
    commandExecutionResult = Selector('[data-testid=welcome-page-title]');
    commandExecutionResultFailed = Selector('[data-testid=cli-output-response-fail]');
    chartViewTypeOptionSelected = Selector('[data-testid=view-type-selected-Plugin-redistimeseries__redistimeseries-chart]');
    scriptsLines = Selector('[data-testid=query-input-container] .view-lines');
    queryJsonResult = Selector('[data-testid=json-view]');
    jsonStringViewTypeOption = Selector('[data-test-subj=view-type-option-Plugin-client-list__json-string-view]');

    graphViewTypeOption = Selector('[data-test-subj^=view-type-option-Plugin-graph]');
    typeSelectedClientsList = Selector('[data-testid=view-type-selected-Plugin-client-list__clients-list]');
    viewTypeOptionClientList = Selector('[data-test-subj=view-type-option-Plugin-client-list__clients-list]');
    viewTypeOptionsText = Selector('[data-test-subj=view-type-option-Text-default__Text]');

    // History containers
    queryCardCommand = Selector('[data-testid=query-card-command]');
    fullScreenButton = Selector('[data-testid=toggle-full-screen]');
    rawModeBtn = Selector('[data-testid="btn-change-mode"]');
    queryCardContainer = Selector('[data-testid^=query-card-container]');
    reRunCommandButton = Selector('[data-testid=re-run-command]');
    copyBtn = Selector('[data-testid^=copy-btn-]');
    copyCommand = Selector('[data-testid=copy-command]');

    //OPTIONS
    selectViewType = Selector('[data-testid=select-view-type]');
    queryTableResult = Selector('[data-testid^=query-table-result-]');
    textViewTypeOption = Selector('[data-test-subj^=view-type-option-Text]');
    tableViewTypeOption = Selector('[data-test-subj^=view-type-option-Plugin]');

    iframe = Selector('[data-testid=pluginIframe]');

    queryTextResult = Selector(this.cssQueryTextResult);

    getTutorialLinkLocator = (tutorialName: string): Selector =>
        Selector(`[data-testid=query-tutorials-link_${tutorialName}]`, { timeout: 2000 } );


    // Select view option in Workbench results
    async selectViewTypeGraph(): Promise<void> {
        await t
            .click(this.selectViewType)
            .click(this.graphViewTypeOption);
    }

    /**
     * Send multiple commands in Workbench
     * @param commands The commands
     */
    async sendMultipleCommandsInWorkbench(commands: string[]): Promise<void> {
        for (const command of commands) {
            await t
                .typeText(this.queryInput, command, { replace: false, speed: 1, paste: true })
                .pressKey('esc')
                .pressKey('enter');
        }
        await t.click(this.submitCommandButton);
    }

    /**
     * Send commands array in Workbench page
     * @param commands The array of commands to send
     */
    async sendCommandsArrayInWorkbench(commands: string[]): Promise<void> {
        for (const command of commands) {
            await this.sendCommandInWorkbench(command);
        }
    }

    // Select Json view option in Workbench results
    async selectViewTypeJson(): Promise<void> {
        await t
            .click(this.selectViewType)
            .click(this.jsonStringViewTypeOption);
    }
    /**
     * Get card container by command
     * @param command The command
     */
    async getCardContainerByCommand(command: string): Promise<Selector> {
        return this.queryCardCommand.withExactText(command).parent(this.cssQueryCardContainer);
    }

    /**
     * Send a command in Workbench with retry mechanism for CI overlay issues
     * @param command The command
     * @param speed The speed in seconds. Default is 1
     * @param paste Whether to paste the command. Default is true
     */
    async sendCommandInWorkbench(command: string, speed = 1, paste = true): Promise<void> {
        const maxRetries = 5;
        let lastError: Error | null = null;

        for (let i = 0; i < maxRetries; i++) {
            try {
                // Wait for any loading states to complete before attempting interaction
                await Common.waitForElementNotVisible(this.runButtonSpinner);
                await Common.waitForElementNotVisible(this.loadedCommand);

                // Wait for the problematic overlay to disappear (CI-specific issue)
                await Common.waitForElementNotVisible(this.overlayContainer);

                // Enhanced wait for database readiness and stability
                await t.wait(2000); // Increased from 500ms to 2000ms

                // Verify UI elements are ready before interaction
                await t.expect(this.queryInput.exists).ok('Query input not found', { timeout: 10000 });
                await t.expect(this.submitCommandButton.exists).ok('Submit button not found', { timeout: 10000 });

                // Perform the actual workbench interaction
                await t
                    .click(this.queryInput)
                    .wait(200) // Small pause after click
                    .typeText(this.queryInput, command, { replace: true, speed, paste })
                    .wait(200) // Small pause after typing
                    .click(this.submitCommandButton);

                // Wait for command to be processed
                await t.wait(1000);

                return; // Success, exit the retry loop
            } catch (error) {
                lastError = error as Error;
                console.warn(`Workbench command attempt ${i + 1}/${maxRetries} failed for command "${command}":`, error);
                console.warn('Error details:', lastError.message, lastError.stack);

                if (i === maxRetries - 1) {
                    // Final attempt failed, throw the error
                    throw new Error(`Failed to send command "${command}" after ${maxRetries} attempts. Last error: ${lastError.message}`);
                }

                // Wait before retrying to allow any animations/transitions to complete
                await t.wait(2000);
            }
        }
    }

    /**
     * Check the last command and result in workbench
     * @param command The command to check
     * @param result The result to check
     * @param childNum Indicator which command result need to check
     */
    async checkWorkbenchCommandResult(command: string, result: string, childNum = 0): Promise<void> {
        // Compare the command with executed command
        const actualCommand = await this.queryCardContainer.nth(childNum).find(this.cssQueryCardCommand).textContent;
        await t.expect(actualCommand).contains(command, 'Actual command is not equal to executed');
        // Compare the command result with executed command
        const actualCommandResult = await this.queryCardContainer.nth(childNum).find(this.cssQueryTextResult).textContent;
        await t.expect(actualCommandResult).contains(result, 'Actual command result is not equal to executed');
    }

    // Select Text view option in Workbench results
    async selectViewTypeText(): Promise<void> {
        await t
            .click(this.selectViewType)
            .click(this.textViewTypeOption);
    }

    // Select Table view option in Workbench results
    async selectViewTypeTable(): Promise<void> {
        await t
            .click(this.selectViewType)
            .doubleClick(this.tableViewTypeOption);
    }

    /**
     * Select query using autosuggest
     * @param query Value of query
     */
    async selectFieldUsingAutosuggest(value: string): Promise<void> {
        await t.wait(200);
        await t.typeText(this.queryInput, '@', { replace: false });
        await t.expect(this.MonacoEditor.monacoSuggestion.visible).ok('Suggestions not displayed');
        await t.typeText(this.queryInput, value, { replace: false });
        // Select query option into autosuggest and go out of quotes
        await t.pressKey('tab');
        await t.pressKey('tab');
        await t.pressKey('right');
        await t.pressKey('space');
    }
}
