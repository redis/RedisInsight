import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { BrowserPage } from '../../../../pageObjects';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

const COMMAND_APPEND = 'APPEND';
const COMMAND_GROUP_SET = 'Set';

fixture `CLI Command helper`
    .meta({ type: 'smoke', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        // Delete database
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can search per command in Command Helper and see relevant results', async t => {
    const commandForSearch = 'ADD';

    // Open Command Helper
    await t.click(browserPage.CommandHelper.expandCommandHelperButton);
    // Search per command
    await t.typeText(browserPage.CommandHelper.cliHelperSearch, commandForSearch, { replace: true, paste: true });
    // Verify results in the output
    const count = await browserPage.CommandHelper.cliHelperOutputTitles.count;
    for(let i = 0; i < count; i++){
        await t.expect(await browserPage.CommandHelper.cliHelperOutputTitles.textContent).contains(commandForSearch, 'Results in the output not contains searched value');
    }

    // Close Command helper
    await t.click(browserPage.CommandHelper.closeCommandHelperButton);
    // Verify that user can close Command helper
    await t.expect(browserPage.CommandHelper.cliHelperText.exists).notOk('Command helper');
});
test('Verify that user can select one of the commands from the list of commands described in the Groups table', async t => {
    const commandForCheck = 'SADD';

    // Open Command Helper
    await t.click(browserPage.CommandHelper.expandCommandHelperButton);
    // Select one command from list
    await browserPage.CommandHelper.selectFilterGroupType(COMMAND_GROUP_SET);
    await t.click(browserPage.CommandHelper.cliHelperOutputTitles.withExactText(commandForCheck));
    // Verify results
    await t.expect(browserPage.CommandHelper.cliHelperTitleArgs.textContent).eql('SADD key member [member ...]', 'Selected command information not correct');
});
test('Verify that user can click on any of searched commands in Command Helper and see details of the command', async t => {
    const commandForSearch = 'Ap';

    // Open Command Helper
    await t.click(browserPage.CommandHelper.expandCommandHelperButton);
    // Select one command from list of searched commands
    await t.typeText(browserPage.CommandHelper.cliHelperSearch, commandForSearch, { replace: true, paste: true });
    await t.click(browserPage.CommandHelper.cliHelperOutputTitles.withExactText(COMMAND_APPEND));
    // Verify details of the command
    await t.expect(browserPage.CommandHelper.cliHelperTitleArgs.textContent).eql('APPEND key value', 'Command name and syntax not correct');
    await t.expect(browserPage.CommandHelper.cliHelperTitle.innerText).contains('STRING', 'Command Group badge not correct');
    await t.expect(browserPage.CommandHelper.cliHelperSummary.innerText).contains('Appends a string to the value of a key. Creates the key if it doesn\'t exist.', 'Command summary not correct');
});
test('Verify that when user enters command, he can see Command Name, Complexity, Arguments, Summary, Group, Read more', async t => {
    const commandForSearch = 'pop';
    const commandForCheck = 'LPOP';

    // Open Command Helper
    await t.click(browserPage.CommandHelper.expandCommandHelperButton);
    // Select one command from list of searched commands
    await t.typeText(browserPage.CommandHelper.cliHelperSearch, commandForSearch, { replace: true, paste: true });
    await t.click(browserPage.CommandHelper.cliHelperOutputTitles.withExactText(commandForCheck));
    // Verify details of the command
    await t.expect(browserPage.CommandHelper.cliHelperTitleArgs.innerText).eql('LPOP key [count]', 'Command Name not correct');
    await t.expect(browserPage.CommandHelper.cliHelperComplexity.innerText).eql('Complexity:\n\nO(N) where N is the number of elements returned', 'Complexity not correct');
    await t.expect(browserPage.CommandHelper.cliHelperArguments.innerText).eql('Arguments:\n\nRequired\n\nkey\n\nOptional\n\n[count]', 'Arguments not correct');
    await t.expect(browserPage.CommandHelper.cliHelperSummary.innerText).contains('Returns the first elements in a list after removing it. Deletes the list if the last element was popped.', 'Command Summary not correct');
    await t.expect(browserPage.CommandHelper.cliHelperTitle.innerText).contains('LIST', 'Command Group not correct');
    await t.expect(browserPage.CommandHelper.readMoreButton.exists).ok('Read more button not displayed');
});
test('Verify that user can see that command is autocompleted in CLI with required arguments', async t => {
    const command = 'HDEL';

    // Open CLI and Helper
    await t.click(browserPage.Cli.cliExpandButton);
    await t.click(browserPage.CommandHelper.expandCommandHelperButton);
    // Search for the command and remember arguments
    await t.typeText(browserPage.CommandHelper.cliHelperSearch, command, { replace: true, paste: true });
    await t.click(browserPage.CommandHelper.cliHelperOutputTitles.withExactText(command));
    const commandArgsFromCliHelper = await browserPage.CommandHelper.cliHelperTitleArgs.innerText;
    // Enter the command in CLI
    await t.typeText(browserPage.Cli.cliCommandInput, command, { replace: true, paste: true });
    // Verify autocompleted arguments
    const commandAutocomplete = await browserPage.Cli.cliCommandAutocomplete.innerText;
    await t.expect(commandArgsFromCliHelper).contains(commandAutocomplete, 'Command autocomplete arguments not correct');
});
