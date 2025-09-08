import { DatabaseHelper } from '../../../../helpers/database';
import { Common } from '../../../../helpers/common';
import { BrowserPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { rte } from '../../../../helpers/constants';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

let keyName = Common.generateWord(20);
const keyTTL = '2147476121';
const jsonValue = '{"name":"xyz"}';
const cliCommands = ['get test', 'acl help', 'client list'];

fixture `CLI`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can see CLI is minimized when he clicks the "minimize" button', async t => {
    const cliColourBefore = await Common.getBackgroundColour(browserPage.Cli.cliBadge);

    // Open CLI and minimize
    await t.click(browserPage.Cli.cliExpandButton);
    await t.click(browserPage.Cli.minimizeCliButton);
    // Verify cli is minimized
    const cliColourAfter = await Common.getBackgroundColour(browserPage.Cli.cliBadge);
    await t.expect(cliColourAfter).notEql(cliColourBefore, 'CLI badge colour is not changed');
    await t.expect(browserPage.Cli.minimizeCliButton.visible).eql(false, 'CLI is not mimized');
});
test('Verify that user can see results history when he re-opens CLI after minimizing', async t => {
    const command = 'SET key';

    // Open CLI and run commands
    await t.click(browserPage.Cli.cliExpandButton);
    await t.typeText(browserPage.Cli.cliCommandInput, command, { replace: true, paste: true });
    await t.pressKey('enter');
    // Minimize and re-open cli
    await t.click(browserPage.Cli.minimizeCliButton);
    await t.click(browserPage.Cli.cliExpandButton);
    // Verify cli results history
    await t.expect(browserPage.Cli.cliCommandExecuted.textContent).eql(command, 'CLI results history not persists after reopening');
});
test
    .after(async() => {
        // Clear database and delete
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
    })('Verify that user can repeat commands by entering a number of repeats before the Redis command in CLI', async t => {
        keyName = Common.generateWord(20);
        const command = `SET ${keyName} a`;
        const repeats = 10;

        // Open CLI and run command with repeats
        await t.click(browserPage.Cli.cliExpandButton);
        await t.typeText(browserPage.Cli.cliCommandInput, `${repeats} ${command}`, { replace: true, paste: true });
        await t.pressKey('enter');
        // Verify result
        await t.expect(browserPage.Cli.cliOutputResponseSuccess.count).eql(repeats, `CLI not contains ${repeats} results`);
    });
test
    .after(async() => {
        // Clear database and delete
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
    })('Verify that user can run command json.get and see JSON object with escaped quotes (\" instead of ")', async t => {
        keyName = Common.generateWord(20);
        const jsonValueCli = '"{\\"name\\":\\"xyz\\"}"';

        // Add Json key with json object
        await browserPage.addJsonKey(keyName, jsonValue, keyTTL);
        const command = `JSON.GET ${keyName}`;
        // Open CLI and run command
        await t.click(browserPage.Cli.cliExpandButton);
        await t.typeText(browserPage.Cli.cliCommandInput, command, { replace: true, paste: true });
        await t.pressKey('enter');
        // Verify result
        await t.expect(browserPage.Cli.cliOutputResponseSuccess.innerText).eql(jsonValueCli, 'The user can not see JSON object with escaped quotes');
    });
test
    .before(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
        for (const command of cliCommands) {
            await browserPage.Cli.sendCommandInCli(command);
        }
    })('Verify that user can use "Up" and "Down" keys to view previous commands in CLI in the application', async t => {
        await t.click(browserPage.Cli.cliExpandButton);
        await t.expect(browserPage.Cli.cliCommandInput.innerText).eql('');
        for (let i = cliCommands.length - 1; i >= 0; i--) {
            await t.pressKey('up');
            await t.expect(browserPage.Cli.cliCommandInput.innerText).eql(cliCommands[i]);
        }
        for (let i = 0; i < cliCommands.length; i++) {
            await t.expect(browserPage.Cli.cliCommandInput.innerText).eql(cliCommands[i]);
            await t.pressKey('down');
        }
    });
