import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { BrowserPage } from '../../../../pageObjects';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

const defaultHelperText = 'Enter any command in CLI or use search to see detailed information.';
const COMMAND_APPEND = 'APPEND';
const COMMAND_GROUP_SET = 'Set';
const COMMAND_GROUP_TIMESERIES = 'TimeSeries';
const COMMAND_GROUP_GRAPH = 'Graph';

fixture `CLI Command helper`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    });
test('Verify Command Helper search and filter', async t => {
    // Open Command Helper
    await t.click(browserPage.CommandHelper.expandCommandHelperButton);
    // Verify default text
    await t.expect(browserPage.CommandHelper.cliHelperText.textContent).eql(defaultHelperText, 'Default text for CLI Helper is not shown');
    // Search any command
    await t.typeText(browserPage.CommandHelper.cliHelperSearch, 'SET', { replace: true, paste: true });
    await t.expect(browserPage.CommandHelper.cliHelperOutputTitles.count).gt(0, 'List of commands were not found');
    // Clear search input
    // todo: add proper attr to html
    const clearButton = browserPage.CommandHelper.cliHelper.find('button title').withExactText('Cancel').parent('button');
    await t.click(clearButton);
    // Verify that when user clears the input in the Search of CLI Helper (via x icon), he can see the default screen with proper the text
    await t.expect(browserPage.CommandHelper.cliHelperText.textContent).eql(defaultHelperText, 'Default text for CLI Helper is not shown');

    // Verify that user can unselect the command filtered to remove filters
    await browserPage.CommandHelper.selectFilterGroupType(COMMAND_GROUP_SET);
    await t.expect(browserPage.CommandHelper.cliHelperOutputTitles.count).gt(0, 'List of commands were not found');
    // Unselect previous command from list
    await t.click(browserPage.CommandHelper.clearAllGroupFilters);
    await t.expect(browserPage.CommandHelper.cliHelperOutputTitles.count).eql(0, 'List of commands were not cleared');
    await t.expect(browserPage.CommandHelper.cliHelperText.textContent).eql(defaultHelperText, 'Default text for CLI Helper is not shown');

    // Verify that user can see relevant search results in Command Helper per every entered symbol
    await t.click(browserPage.CommandHelper.cliHelperSearch);
    await t.typeText(browserPage.CommandHelper.cliHelperSearch, 's');
    // Verify that we found commands
    await t.expect(browserPage.CommandHelper.cliHelperOutputTitles.count).gt(0, 'List of commands were not found');
    const countCommandsOfOneLetterSearch = await browserPage.CommandHelper.cliHelperOutputTitles.count;
    // Continue typing
    await t.typeText(browserPage.CommandHelper.cliHelperSearch, 'a');
    const countCommandsOfTwoLettersSearch = await browserPage.CommandHelper.cliHelperOutputTitles.count;
    // Verify that first list has more count than the second
    await t.expect(countCommandsOfOneLetterSearch).gt(countCommandsOfTwoLettersSearch, 'Count of commands with 1 letter not more than 2');

    // Verify that when user has used search and apply filters, search results include only commands from the filter group applied
    await browserPage.CommandHelper.selectFilterGroupType(COMMAND_GROUP_SET);
    await t.expect(browserPage.CommandHelper.cliHelperOutputTitles.withText('SAVE').exists).notOk('Commands found from another group');
    await t.expect(browserPage.CommandHelper.cliHelperOutputTitles.withText('SADD').exists).ok('Proper command was not found');

    // Verify that Command helper cleared when user runs the command in CLI
    await t.click(browserPage.Cli.cliExpandButton);
    // Enter command into CLI
    await t.typeText(browserPage.Cli.cliCommandInput, COMMAND_APPEND, { speed: 0.5, replace: true, paste: true });
    await t.expect(browserPage.CommandHelper.filterGroupTypeButton.textContent).notContains(COMMAND_GROUP_SET, 'Filter was not cleared');
    await t.expect(browserPage.CommandHelper.cliHelperSearch.value).eql('', 'Search was not cleared');

    // Verify that when user enters command in CLI, Helper displays additional info about the command
    await t.expect(browserPage.CommandHelper.cliHelperTitleArgs.textContent).eql('APPEND key value', 'Command name and syntax not displayed');
    await t.expect(browserPage.CommandHelper.cliHelperTitle.innerText).contains('STRING', 'Command Group badge not displayed');
    await t.expect(browserPage.CommandHelper.cliHelperSummary.innerText).contains('Appends a string to the value of a key. Creates the key if it doesn\'t exist.', 'Command summary not displayed');
});
test('Verify that user can type TS. in Command helper and see commands from RedisTimeSeries commands.json', async t => {
    const commandForSearch = 'TS.';
    // Open Command Helper
    await t.click(browserPage.CommandHelper.expandCommandHelperButton);
    // Select group from list and remember commands
    await browserPage.CommandHelper.selectFilterGroupType(COMMAND_GROUP_TIMESERIES);
    const commandsFilterCount = await browserPage.CommandHelper.cliHelperOutputTitles.count;
    const timeSeriesCommands: string[] = [];
    for(let i = 0; i < commandsFilterCount; i++) {
        timeSeriesCommands.push(await browserPage.CommandHelper.cliHelperOutputTitles.nth(i).textContent);
    }
    // Unselect group from list
    await browserPage.CommandHelper.selectFilterGroupType(COMMAND_GROUP_TIMESERIES);
    // Search per part of command and check all opened commands
    await browserPage.CommandHelper.checkSearchedCommandInCommandHelper(commandForSearch, timeSeriesCommands);
    // Check the first command documentation url
    await browserPage.CommandHelper.checkURLCommand(timeSeriesCommands[0], `https://redis.io/docs/latest/commands/${timeSeriesCommands[0].toLowerCase()}?utm_source=redisinsight&utm_medium=app&utm_campaign=redisinsight_command_helper`);
});
// outdated after https://redislabs.atlassian.net/browse/RI-4608
test.skip('Verify that user can type GRAPH. in Command helper and see auto-suggestions from RedisGraph commands.json', async t => {
    const commandForSearch = 'GRAPH.';
    // const externalPageLink = 'https://redis.io/commands/graph.config-get/';
    // Open Command Helper
    await t.click(browserPage.CommandHelper.expandCommandHelperButton);
    // Select group from list and remember commands
    await browserPage.CommandHelper.selectFilterGroupType(COMMAND_GROUP_GRAPH);
    const commandsFilterCount = await browserPage.CommandHelper.cliHelperOutputTitles.count;
    const graphCommands: string[] = [];
    for(let i = 0; i < commandsFilterCount; i++) {
        graphCommands.push(await browserPage.CommandHelper.cliHelperOutputTitles.nth(i).textContent);
    }
    // Unselect group from list
    await browserPage.CommandHelper.selectFilterGroupType(COMMAND_GROUP_GRAPH);
    // Search per part of command and check all opened commands
    await browserPage.CommandHelper.checkSearchedCommandInCommandHelper(commandForSearch, graphCommands);
    // update after resolving testcafe Native Automation mode limitations
    // // Check the first command documentation url
    // await browserPage.CommandHelper.checkURLCommand(graphCommands[0], externalPageLink);
    // await t.switchToParentWindow();
});
