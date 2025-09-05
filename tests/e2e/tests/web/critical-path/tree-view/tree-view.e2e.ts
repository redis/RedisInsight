import { DatabaseHelper } from '../../../../helpers/database';
import {BrowserPage, MyRedisDatabasePage, SettingsPage} from '../../../../pageObjects'
import { commonUrl, ossStandaloneBigConfig } from '../../../../helpers/conf';
import { rte, KeyTypesTexts } from '../../../../helpers/constants';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { verifySearchFilterValue } from '../../../../helpers/keys';

const browserPage = new BrowserPage();
const settingsPage = new SettingsPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const myRedisDatabasePage = new MyRedisDatabasePage();

fixture `Tree view verifications`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig);
    });
test('Verify that user can see that "Tree view" mode is enabled state is saved when refreshes the page', async t => {
    await t.click(browserPage.NavigationPanel.settingsButton);
    await t.click(settingsPage.accordionAdvancedSettings);
    await settingsPage.changeKeysToScanValue('10000');
    await myRedisDatabasePage.navigateToDatabase(ossStandaloneBigConfig.databaseName);
    // Verify that when user opens the application he can see that Tree View is disabled by default(Browser is selected by default)
    await t.expect(browserPage.browserViewButton.getStyleProperty('background-color')).eql('rgb(41, 47, 71)', 'The Browser is not selected by default');
    await t.expect(browserPage.TreeView.treeViewSettingsBtn.exists).notOk('The tree view is displayed', { timeout: 5000 });

    await t.click(browserPage.treeViewButton);
    await browserPage.reloadPage();
    // Verify that "Tree view" mode enabled state is saved
    await t.expect(browserPage.TreeView.treeViewSettingsBtn.exists).ok('The tree view is not displayed');

    // Verify that user can scan DB by 10K in tree view
    await browserPage.verifyScannningMore();
}).skip.meta({skipComment: "Unstable CI execution,  AssertionError, needs investigation"});
// outdated Verify that when user enables filtering by key name he can see only folder with appropriate keys are displayed and the number of keys and percentage is recalculated
test('Verify that when user switched from Tree View to Browser and goes back state of filer by key name/key type is saved', async t => {
    const keyName = 'user*';
    await t.click(browserPage.treeViewButton);
    await browserPage.searchByKeyName(keyName);
    await t.click(browserPage.browserViewButton);
    await t.click(browserPage.treeViewButton);
    // Verify that state of filer by key name is saved
    await verifySearchFilterValue(keyName);
    await t.click(browserPage.treeViewButton);
    // Set filter by key type
    await browserPage.selectFilterGroupType(KeyTypesTexts.String);
    await t.click(browserPage.browserViewButton);
    await t.click(browserPage.treeViewButton);
    // Verify that state of filer by key type is saved
    await t.expect(browserPage.filterByKeyTypeDropDown.innerText).eql(KeyTypesTexts.String, 'Filter per key type is not applied');
});
