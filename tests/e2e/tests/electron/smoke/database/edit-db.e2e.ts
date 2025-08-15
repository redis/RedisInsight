import { ClientFunction } from 'testcafe';
import { DatabaseHelper } from '../../../../helpers/database';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import {
    commonUrl,
    redisEnterpriseClusterConfig
} from '../../../../helpers/conf';
import { rte } from '../../../../helpers/constants';

const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseHelper = new DatabaseHelper();

fixture `Edit Databases`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
    });
// Returns the URL of the current web page
const getPageUrl = ClientFunction(() => window.location.href);
test.skip
    .meta({ rte: rte.reCluster })
    .after(async() => {
        // Delete database
        await databaseHelper.deleteDatabase(redisEnterpriseClusterConfig.databaseName);
    })('Verify that user can connect to the RE cluster database', async t => {
        await databaseHelper.addNewREClusterDatabase(redisEnterpriseClusterConfig);
        await myRedisDatabasePage.clickOnDBByName(redisEnterpriseClusterConfig.databaseName);
        await t.expect(getPageUrl()).contains('browser', 'The edit view is not opened');
    });
