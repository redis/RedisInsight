import { ClientFunction } from 'testcafe';
import { DatabaseHelper } from '../../../../helpers/database';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../../helpers/conf';
import { rte } from '../../../../helpers/constants';
import { UserAgreementDialog } from '../../../../pageObjects/dialogs';

const myRedisDatabasePage = new MyRedisDatabasePage();
const userAgreementDialog = new UserAgreementDialog();
const databaseHelper = new DatabaseHelper();

fixture `Edit Databases`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
    });
// Returns the URL of the current web page
const getPageUrl = ClientFunction(() => window.location.href);
test
    .meta({ rte: rte.standalone })
    .after(async() => {
        // Delete database
        await databaseHelper.deleteDatabase(ossStandaloneConfig.databaseName);
    })
    .skip('Verify that user open edit view of database', async t => {
        await userAgreementDialog.acceptLicenseTerms();
        await t.expect(myRedisDatabasePage.AddRedisDatabaseDialog.addDatabaseButton.exists).ok('The add redis database view not found', { timeout: 10000 });
        await databaseHelper.addNewStandaloneDatabase(ossStandaloneConfig);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await t.expect(getPageUrl()).contains('browser', 'Browser page not opened');
    });
