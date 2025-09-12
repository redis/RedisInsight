import { Selector, t } from 'testcafe';
import { Common } from '../../../helpers/common';

export class CommandHelper {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //BUTTONS
    expandCommandHelperButton = Selector('[data-testid=expand-command-helper]');
    closeCommandHelperButton = Selector('[data-testid=close-command-helper]');
    minimizeCommandHelperButton = Selector('[data-testid=hide-command-helper]');
    commandHelperBadge = Selector('[data-testid=expand-command-helper] span');
    commandHelperArea = Selector('[data-testid=command-helper]');
    cliHelperSearch = Selector('[data-testid=cli-helper-search]');
    readMoreButton = Selector('[data-testid=read-more]');
    returnToList = Selector('[data-testid=cli-helper-back-to-list-btn]');
    filterGroupTypeButton = Selector('[data-testid=select-filter-group-type]');
    filterOptionGroupType = Selector('[data-test-subj^=filter-option-group-type-]');
    clearAllGroupFilters = Selector('[data-testid=select-filter-group-type] button title').withExactText('Clear All').parent('button');

    //TEXT ELEMENTS
    cliHelper = Selector('[data-testid=cli-helper]');
    cliHelperText = Selector('[data-testid=cli-helper-default]');
    cliHelperOutputTitles = Selector('[data-testid^=cli-helper-output-title-]');
    cliHelperTitle = Selector('[data-testid=cli-helper-title]');
    cliHelperTitleArgs = Selector('[data-testid=cli-helper-title-args]');
    cliHelperSummary = Selector('[data-testid=cli-helper-summary]');
    cliHelperArguments = Selector('[data-testid=cli-helper-arguments]');
    cliHelperComplexity = Selector('[data-testid=cli-helper-complexity]');

    /**
     * Select filter group type
     * @param groupName The group name
     */
    async selectFilterGroupType(groupName: string): Promise<void> {
        await t.click(this.filterGroupTypeButton);
        await t.click(this.filterOptionGroupType.withExactText(groupName));
    }

    /**
     * Check URL of command opened from command helper
     * @param command The command for which to open Read more link
     * @param url Command URL for external resource
     */
    async checkURLCommand(command: string, url: string): Promise<void> {
        await t.click(this.cliHelperOutputTitles.withExactText(command));
        await t.click(this.readMoreButton);
        await t.expect(await Common.getPageUrl()).eql(url, 'The opened page not correct');
    }

    /**
     * Check list of commands searched
     * @param searchedCommand Searched command in Command Helper
     * @param listToCompare The list with commands to compare with opened in Command Helper
     */
    async checkSearchedCommandInCommandHelper(searchedCommand: string, listToCompare: string[]): Promise<void> {
        await t.typeText(this.cliHelperSearch, searchedCommand, { speed: 0.5 });
        //Verify results in the output
        const commandsCount = await this.cliHelperOutputTitles.count;
        for (let i = 0; i < commandsCount; i++) {
            await t.expect(this.cliHelperOutputTitles.nth(i).textContent).eql(listToCompare[i], 'Results in the output contains searched value');
        }
    }

    /**
     * Check commands list
     * @param listToCompare The list with commands to compare with opened in Command Helper
     */
    async checkCommandsInCommandHelper(listToCompare: string[]): Promise<void> {
        //Verify results in the output
        const commandsCount = await this.cliHelperOutputTitles.count;
        for (let i = 0; i < commandsCount; i++) {
            await t.expect(this.cliHelperOutputTitles.nth(i).textContent).eql(listToCompare[i], 'Results in the output not contain searched value');
        }
    }
}
