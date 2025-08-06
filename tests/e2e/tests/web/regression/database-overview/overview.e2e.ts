import { rte } from '../../../../helpers/constants';
import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage } from '../../../../pageObjects';
import { commonUrl, cloudDatabaseConfig } from '../../../../helpers/conf';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();

fixture `Overview`
    .meta({ type: 'regression', rte: rte.reCloud })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTermsAndAddRECloudDatabase(cloudDatabaseConfig);
    })
    .afterEach(async() => {
        // Delete database
        await databaseHelper.deleteDatabase(cloudDatabaseConfig.databaseName);
    });
test
    .skip('Verify that user can see not available metrics from Overview in tooltip with the text "<Metric_name> is/are not available"', async t => {
    // Verify that CPU parameter is not displayed in Overview
    await t.expect(browserPage.OverviewPanel.overviewCpu.exists).notOk('Not available CPU is displayed');
});
