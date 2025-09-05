import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import {
    commonUrl,
    ossStandaloneBigConfig
} from '../../../../helpers/conf';
import { KeyTypesTexts, rte } from '../../../../helpers/constants';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

fixture `Key name filters history`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig);
    });
test('Recent filters history', async t => {
    const keysForSearch = ['device', 'mobile'];

    await browserPage.selectFilterGroupType(KeyTypesTexts.String);
    // Verify that user can not see filters per only key type in the history of results
    await t.expect(browserPage.showFilterHistoryBtn.exists).notOk('Filter history button displayed for key type search');
    // Search by valid key
    await browserPage.searchByKeyName(`${keysForSearch[0]}*`);
    await browserPage.clearFilter();

    // Verify that user can see the history query is automatically run once selected
    await t.click(browserPage.showFilterHistoryBtn);
    await t.click(browserPage.filterHistoryOption.nth(0));
    for (let i = 0; i < 5; i++) {
        // Verify that keys are filtered
        await t.expect(browserPage.keyNameInTheList.nth(i).textContent).contains(keysForSearch[0], 'Keys not filtered by key name')
            .expect(browserPage.filteringLabel.nth(i).textContent).contains(KeyTypesTexts.String, 'Keys not filtered by key type');
    }

    // Verify that user do not see duplicate history requests
    await browserPage.clearFilter();
    await browserPage.selectFilterGroupType(KeyTypesTexts.String);
    await browserPage.searchByKeyName(`${keysForSearch[0]}*`);
    await t.click(browserPage.showFilterHistoryBtn);
    await t.expect(browserPage.filterHistoryItemText.withText(keysForSearch[0]).count).eql(1, 'Filter history requests can be duplicated in list');

    // Refresh the page
    await browserPage.reloadPage();
    // Verify that user can see the list of filters even when reloading page
    await t.click(browserPage.showFilterHistoryBtn);
    await t.expect(browserPage.filterHistoryItemText.withText(keysForSearch[0]).exists).ok('Filter history requests not saved after reloading page');

    // Open Tree view to check also there
    await t.click(browserPage.showFilterHistoryBtn);
    await t.click(browserPage.treeViewButton);
    // Search by 2nd key name
    await browserPage.searchByKeyName(`${keysForSearch[1]}*`);
    await t.click(browserPage.showFilterHistoryBtn);
    // Verify that user can remove saved filter from list by clicking on "X"
    await t.hover(browserPage.filterHistoryItemText.withText(keysForSearch[1]));
    await t.click(browserPage.filterHistoryOption.withText(keysForSearch[1]).find(browserPage.cssRemoveSuggestionItem));
    await t.expect(browserPage.filterHistoryItemText.withText(keysForSearch[1]).exists).notOk('Filter history request not deleted');
    // Verify that user can clear the history of requests
    await t.click(browserPage.clearFilterHistoryBtn);
    await t.expect(browserPage.showFilterHistoryBtn.exists).notOk('Filter history button displayed for key type search');
});
