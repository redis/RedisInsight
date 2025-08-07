import { DatabaseHelper } from '../../../../helpers/database';
import { MyRedisDatabasePage, BrowserPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneBigConfig, ossStandaloneConfig } from '../../../../helpers/conf';
import { Common } from '../../../../helpers/common';
import { KeyTypesTexts, rte } from '../../../../helpers/constants';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { verifySearchFilterValue } from '../../../../helpers/keys';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

const speed = 0.4;
let keyName = Common.generateWord(10);
let keys: string[];

fixture `Browser Context`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    })
    .afterEach(async() => {
        // Delete database
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
// Update after resolving https://redislabs.atlassian.net/browse/RI-3299
test.skip('Verify that user can see saved CLI size on Browser page when he returns back to Browser page', async t => {
    const offsetY = 200;

    await t.click(browserPage.Cli.cliExpandButton);
    const cliAreaHeight = await browserPage.Cli.cliArea.clientHeight;
    const cliAreaHeightEnd = cliAreaHeight + 150;
    const cliResizeButton = browserPage.Cli.cliResizeButton;
    await t.hover(cliResizeButton);
    // move resize 200px up
    await t.drag(cliResizeButton, 0, -offsetY, { speed: 0.01 });
    await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    await t.expect(await browserPage.Cli.cliArea.clientHeight).gt(cliAreaHeightEnd, 'Saved context for resizable cli is incorrect');
});
test.skip('Verify that user can see saved Key details and Keys tables size on Browser page when he returns back to Browser page', async t => {
    const offsetX = 200;
    const keyListWidth = await browserPage.keyListTable.clientWidth;
    const cliResizeButton = await browserPage.resizeBtnKeyList;

    // move resize 200px right
    await t.drag(cliResizeButton, offsetX, 0, { speed });
    await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    await t.expect(await browserPage.keyListTable.clientWidth).gt(keyListWidth, 'Saved browser resizable context is proper');
});
test('Verify that user can see saved filter per key type applied when he returns back to Browser page', async t => {
    keyName = Common.generateWord(10);
    // Filter per key type String and open Settings
    await browserPage.selectFilterGroupType(KeyTypesTexts.String);
    await t.click(myRedisDatabasePage.NavigationPanel.settingsButton);
    // Return back to Browser and check filter applied
    await t.click(myRedisDatabasePage.NavigationPanel.browserButton);
    await t.expect(browserPage.filterByKeyTypeDropDown.innerText).eql(KeyTypesTexts.String, 'Filter per key type is still applied');
    // Clear filter
    await browserPage.setAllKeyType();
    // Filter per key name and open Settings
    await browserPage.searchByKeyName(keyName);
    await t.click(myRedisDatabasePage.NavigationPanel.settingsButton);
    // Return back to Browser and check filter applied
    await t.click(myRedisDatabasePage.NavigationPanel.browserButton);
    // Verify that user can see saved input entered into the filter per Key name when he returns back to Browser page
    await verifySearchFilterValue(keyName);
});
test('Verify that user can see saved executed commands in CLI on Browser page when he returns back to Browser page', async t => {
    const commands = [
        'SET key',
        'client getname'
    ];

    // Execute command in CLI and open Settings page
    await t.click(browserPage.Cli.cliExpandButton);
    for(const command of commands) {
        await t.typeText(browserPage.Cli.cliCommandInput, command, { replace: true, paste: true });
        await t.pressKey('enter');
    }
    await t.click(myRedisDatabasePage.NavigationPanel.settingsButton);
    // Return back to Browser and check executed command in CLI
    await t.click(myRedisDatabasePage.NavigationPanel.browserButton);
    for(const command of commands) {
        await t.expect(browserPage.Cli.cliCommandExecuted.withExactText(command).exists).ok(`Executed command '${command}' in CLI is saved`);
    }
});
test
    .before(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig);
    })
    .after(async() => {
        // Delete database
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneBigConfig);
    })('Verify that user can see key details selected when he returns back to Browser page', async t => {
        // Scroll keys elements
        const scrollY = 1000;
        await t.scroll(browserPage.cssSelectorGrid, 0, scrollY);

        const virtualizedTableKeyIndex = browserPage.virtualTableContainer.find(browserPage.cssVirtualTableRow).nth(10);
        const targetKeyIndex = await virtualizedTableKeyIndex.getAttribute('aria-rowindex');
        const targetKey = browserPage.virtualTableContainer.find(`[aria-rowindex="${targetKeyIndex}"`);
        const targetKeyName = await targetKey.find(browserPage.cssSelectorKey).innerText;

        // Open key details
        await t.click(targetKey);
        // Verify that key selected
        await t.expect(targetKey.getAttribute('class')).contains('table-row-selected', 'Not correct key selected in key list');

        await t.click(myRedisDatabasePage.NavigationPanel.settingsButton);
        // Return back to Browser and check key details selected
        await t.click(myRedisDatabasePage.NavigationPanel.browserButton);
        // Check Keys details saved
        await t.expect(browserPage.keyNameFormDetails.innerText).eql(targetKeyName, 'Key details is not saved as context');
        // Check Key selected in Key List
        await t.expect(targetKey.getAttribute('class')).contains('table-row-selected', 'Not correct key selected in key list');
    });
test
    .after(async() => {
        // Clear and delete database
        await browserPage.Cli.sendCommandInCli(`DEL ${keys.join(' ')}`);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Verify that user can see list of keys viewed on Browser page when he returns back to Browser page', async t => {
        const numberOfItems = 5000;
        const scrollY = 3200;
        // Open CLI
        await t.click(browserPage.Cli.cliExpandButton);
        // Create new keys
        keys = await Common.createArrayWithKeyValue(numberOfItems);
        await t.typeText(browserPage.Cli.cliCommandInput, `MSET ${keys.join(' ')}`, { replace: true, paste: true });
        await t.pressKey('enter');
        await t.click(browserPage.Cli.cliCollapseButton);
        await t.click(browserPage.refreshKeysButton);

        const keyList = browserPage.keyListTable;
        const keyListSGrid = keyList.find(browserPage.cssSelectorGrid);

        // Scroll key list
        await t.scroll(keyListSGrid, 0, scrollY);
        // Find any key from list that is visible
        const renderedRows = keyList.find(browserPage.cssSelectorRows);
        const renderedRowsCount = await renderedRows.count;
        const randomKey = renderedRows.nth(Math.floor((Math.random() * renderedRowsCount)));
        const randomKeyName = await randomKey.find(browserPage.cssSelectorKey).textContent;

        await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);

        // Check that previous found key is still visible
        const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(randomKeyName);
        await t.expect(isKeyIsDisplayedInTheList).ok('Scrolled position and saved key list is proper');
    });
