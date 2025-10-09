import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { rte } from '../../../../helpers/constants';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { Common } from '../../../../helpers/common';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

let keyName: string;

fixture `Actions with Key List on Browser page`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
        keyName = Common.generateWord(10);
    });
test('Verify that user can delete key in List mode', async t => {
    // Add new key
    await browserPage.addStringKey(keyName);
    await browserPage.deleteKeyByNameFromList(keyName);
    await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).notOk('The Key wasn\'t deleted');
});
test('Verify that user can delete key in Tree view', async t => {
    // Add new key
    await browserPage.addStringKey(keyName);
    await t.click(browserPage.treeViewButton);
    await browserPage.deleteKeyByNameFromList(keyName);
    await t.expect(await browserPage.isKeyIsDisplayedInTheList(keyName)).notOk('The Key wasn\'t deleted');
});
