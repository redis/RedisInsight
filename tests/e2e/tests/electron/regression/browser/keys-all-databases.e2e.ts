import { Selector, t } from 'testcafe';
import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import {
    commonUrl,
    redisEnterpriseClusterConfig
} from '../../../../helpers/conf';
import { Common } from '../../../../helpers/common';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const apiKeyRequests = new APIKeyRequests();

let keyName = Common.generateWord(10);
const verifyKeysAdded = async(): Promise<void> => {
    keyName = Common.generateWord(10);
    // Add Hash key
    await browserPage.addHashKey(keyName);
    // Check the notification message
    const notification = browserPage.Toast.toastHeader.textContent;
    await t.expect(notification).contains('Key has been added', 'The notification not correct');
    // Check that new key is displayed in the list
    await browserPage.searchByKeyName(keyName);
    const keyNameInTheList = Selector(`[data-testid="key-${keyName}"]`);
    await Common.waitForElementNotVisible(browserPage.loader);
    await t.expect(keyNameInTheList.exists).ok(`${keyName} key is not added`);
};

fixture `Work with keys in all types of databases`
    .meta({ type: 'regression' })
    .page(commonUrl);
test
    .meta({ rte: rte.reCluster })
    .before(async() => {
        await databaseHelper.acceptLicenseTermsAndAddRedisSoftwareDatabase(redisEnterpriseClusterConfig);
    })
    .after(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, redisEnterpriseClusterConfig.databaseName);
        await databaseHelper.deleteDatabase(redisEnterpriseClusterConfig.databaseName);
    })
    .skip('Verify that user can add Key in RE Cluster DB', async() => {
        await verifyKeysAdded();
    });
