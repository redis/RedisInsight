import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { MyRedisDatabasePage, BrowserPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { Common } from '../../../../helpers/common';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';
import { goBackHistory } from '../../../../helpers/utils';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

let keyName = Common.generateWord(10);

fixture `CLI`
    .meta({ type: 'smoke', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        // Delete database
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test
    .after(async() => {
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Verify that user can add data via CLI', async t => {
        keyName = Common.generateWord(10);
        // Open CLI
        await t.click(browserPage.Cli.cliExpandButton);
        // Verify that user can expand CLI
        await t.expect(browserPage.Cli.cliArea.exists).ok('CLI area is not displayed');
        await t.expect(browserPage.Cli.cliCommandInput.exists).ok('CLI input is not displayed');

        // Add key from CLI
        await t.typeText(browserPage.Cli.cliCommandInput, `SADD ${keyName} "chinese" "japanese" "german"`, { replace: true, paste: true });
        await t.pressKey('enter');
        // Check that the key is added
        await browserPage.searchByKeyName(keyName);
        const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
        await t.expect(isKeyIsDisplayedInTheList).ok('The key is not added');
    });
test.skip('Verify that user can use blocking command', async t => {
    // Open CLI
    await t.click(browserPage.Cli.cliExpandButton);
    // Check that CLI is opened
    await t.expect(browserPage.Cli.cliArea.visible).ok('CLI area is not displayed');
    // Type blocking command
    await t.typeText(browserPage.Cli.cliCommandInput, 'blpop newKey 10000', { replace: true, paste: true });
    await t.pressKey('enter');
    // Verify that user input is blocked
    await t.expect(browserPage.Cli.cliCommandInput.exists).notOk('Cli input is still shown');

    // Collaple CLI
    await t.click(browserPage.Cli.cliCollapseButton);
    // Verify that user can collapse CLI
    await t.expect(browserPage.Cli.cliArea.visible).notOk('CLI area should still displayed');
});
// update after resolving testcafe Native Automation mode limitations
test.skip('Verify that user can use unblocking command', async t => {
    // Open CLI
    await t.click(browserPage.Cli.cliExpandButton);
    // Get clientId
    await t.typeText(browserPage.Cli.cliCommandInput, 'client id');
    await t.pressKey('enter');
    const clientId = (await browserPage.Cli.cliOutputResponseSuccess.textContent).replace(/^\D+/g, '');
    // Type blocking command
    await t.typeText(browserPage.Cli.cliCommandInput, 'blpop newKey 10000', { replace: true, paste: true });
    await t.pressKey('enter');
    // Verify that user input is blocked
    await t.expect(browserPage.Cli.cliCommandInput.exists).notOk('Cli input is still shown');
    // Create new window to unblock the client
    //await openRedisHomePage();
    await t.click(browserPage.NavigationPanel.myRedisDBButton);
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    // Open CLI
    await t.click(browserPage.Cli.cliExpandButton);
    // Unblock client
    await t.typeText(browserPage.Cli.cliCommandInput, `client unblock ${clientId}`, { replace: true, paste: true });
    await t.pressKey('enter');
    await goBackHistory();
    await t.expect(browserPage.Cli.cliCommandInput.exists).ok('Cli input is not shown, the client still blocked', { timeout: 10000 });
});
