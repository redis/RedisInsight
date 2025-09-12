import { keyLength, rte } from '../../../../helpers/constants';
import { addKeysViaCli, deleteKeysViaCli, keyTypes } from '../../../../helpers/keys';
import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage, MyRedisDatabasePage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfigEmpty } from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { Common } from '../../../../helpers/common';

const browserPage = new BrowserPage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

const keysData = keyTypes.map(object => ({ ...object }));
keysData.forEach(key => key.keyName = `${key.keyName}` + '-' + `${Common.generateWord(keyLength)}`);
const databasesForAdding = [
    { host: ossStandaloneConfigEmpty.host, port: ossStandaloneConfigEmpty.port, databaseName: 'testDB1' },
    { host: ossStandaloneConfigEmpty.host, port: ossStandaloneConfigEmpty.port, databaseName: 'testDB2' }
];

fixture `Format switcher functionality`
    .meta({
        type: 'regression',
        rte: rte.standalone
    })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfigEmpty);
        // Create new keys
        await addKeysViaCli(keysData);
    })
    .afterEach(async() => {
        // Clear keys and database
        await deleteKeysViaCli(keysData);
    });
test
    .before(async() => {
        // Add new databases using API
        await databaseHelper.acceptLicenseTerms();
        await databaseAPIRequests.addNewStandaloneDatabasesApi(databasesForAdding);
        // Reload Page
        await browserPage.reloadPage();
        await myRedisDatabasePage.clickOnDBByName(databasesForAdding[0].databaseName);
        // Create new keys
        await addKeysViaCli(keysData);
    })
    .after(async() => {
        // Clear keys and database
        await deleteKeysViaCli(keysData);
        await databaseAPIRequests.deleteStandaloneDatabasesApi(databasesForAdding);
    })('Formatters saved selection', async t => {
        // Open key details and select JSON formatter
        await browserPage.openKeyDetails(keysData[0].keyName);
        await browserPage.selectFormatter('JSON');
        // Reopen key details
        await t.click(browserPage.closeKeyButton);
        await browserPage.navigateToKey(keysData[0].keyName);
        // Verify that formatters selection is saved when user switches between keys
        await t.expect(browserPage.formatSwitcher.withExactText('JSON').visible).ok('Formatter value is not saved');
        // Verify that formatters selection is saved when user reloads the page
        await browserPage.reloadPage();
        await browserPage.navigateToKey(keysData[1].keyName);
        await t.expect(browserPage.formatSwitcher.withExactText('JSON').visible).ok('Formatter value is not saved');
        // Go to another database
        await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(databasesForAdding[1].databaseName);
        await browserPage.navigateToKey(keysData[2].keyName);
        // Verify that formatters selection is saved when user switches between databases
        await t.expect(browserPage.formatSwitcher.withExactText('JSON').visible).ok('Formatter value is not saved');
    });
test('Verify that user can see switcher icon for narrow screen and tooltip by hovering', async t => {
    // Create array with JSON, GRAPH, TS keys
    const keysWithoutSwitcher = [keysData[5], keysData[7], keysData[8]];

    for (let i = 0; i < keysWithoutSwitcher.length; i++) {
        await browserPage.navigateToKey(keysWithoutSwitcher[i].keyName);
        // Verify that user don`t see format switcher for JSON, GRAPH, TS keys
        await t.expect(browserPage.formatSwitcher.exists).notOk(`Formatter is displayed for ${keysWithoutSwitcher[i].textType} type`, { timeout: 1000 });
    }

    await browserPage.navigateToKey(keysData[0].keyName);
    await browserPage.selectFormatter('JSON');
    // Verify icon is not displayed with high screen resolution
    await t.expect(browserPage.formatSwitcherIcon.exists).notOk('Format switcher Icon is displayed with high screen resolution');
    // Minimize the window to check icon
    await t.resizeWindow(1500, 900);
    // Verify icon is displayed with low screen resolution
    await t.expect(browserPage.formatSwitcherIcon.exists).ok('Format switcher Icon is not displayed with low screen resolution');
    await t.setTestSpeed(0.7);
    await t.hover(browserPage.formatSwitcher.find('[data-testid^=key-value-formatter-option-selected]'));
    // Verify tooltip is displayed on hover with low screen resolution
    await t.expect(browserPage.tooltip.textContent).contains('JSON', 'Selected formatter is not displayed in tooltip');
});
