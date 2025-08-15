import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { rte } from '../../../../helpers/constants';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { Common } from '../../../../helpers/common';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const apiKeyRequests = new APIKeyRequests();

let keyName: string;

fixture `Key Details`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
        keyName = Common.generateWord(10);
        await browserPage.addStringKey(keyName);
    })
    .afterEach(async() => {
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test
.skip('Verify that user can see the list of keys when click on “Back” button', async t => {
    await t.expect(browserPage.backToBrowserBtn.exists).notOk('"< Browser" button displayed for normal screen resolution');
    // Minimize the window to check icon
    await t.resizeWindow(1200, 900);
    await t.expect(browserPage.keyDetailsTable.visible).ok('Key details not opened', { timeout: 1000 });
    // Verify that user can see the “Back” button when work with the values of keys on small resolutions
    await t.expect(browserPage.backToBrowserBtn.exists).ok('"< Browser" button not displayed for small screen resolution');
    await t.click(browserPage.backToBrowserBtn);
    // Verify that key details closed
    await t.expect(browserPage.keyDetailsTable.visible).notOk('Key details not closed by clicking on "< Browser" button', { timeout: 1000 });
});
