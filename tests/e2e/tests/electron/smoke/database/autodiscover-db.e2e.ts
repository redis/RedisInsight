import { DatabaseHelper } from '../../../../helpers/database';
import {
    commonUrl,
    redisEnterpriseClusterConfig
} from '../../../../helpers/conf';
import { rte } from '../../../../helpers/constants';
import { MyRedisDatabasePage } from '../../../../pageObjects';

const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseHelper = new DatabaseHelper();

fixture `Add database`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
    });
test.skip
    .meta({ rte: rte.reCluster })
    .after(async() => {
        await databaseHelper.deleteDatabase(redisEnterpriseClusterConfig.databaseName);
    })('Verify that user can add database from RE Cluster via auto-discover flow', async() => {
        await databaseHelper.addNewRedisSoftwareDatabase(redisEnterpriseClusterConfig);
        // Verify that user can see an indicator of databases that are added using autodiscovery and not opened yet
        // Verify new connection badge for RE cluster
        await myRedisDatabasePage.verifyDatabaseStatusIsVisible(redisEnterpriseClusterConfig.databaseName);
    });
