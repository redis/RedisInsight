import { DatabaseHelper } from '../../../../helpers/database';
import { commonUrl, ossSentinelConfig } from '../../../../helpers/conf';
import { rte } from '../../../../helpers/constants';
import { MyRedisDatabasePage } from '../../../../pageObjects';

const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseHelper = new DatabaseHelper();

// todo: enable after RI-7463 fix
fixture.skip `Add DBs from Sentinel`
    .page(commonUrl)
    .meta({ type: 'smoke', rte: rte.standalone })
    .beforeEach(async() => {
        await databaseHelper.acceptLicenseTerms();
    })
    .afterEach(async() => {
        //Delete database
        await myRedisDatabasePage.deleteDatabaseByName(ossSentinelConfig.masters[0].alias);
        await myRedisDatabasePage.deleteDatabaseByName(ossSentinelConfig.masters[1].alias);
    });
test('Verify that user can add Sentinel DB', async t => {
    await databaseHelper.discoverSentinelDatabase(ossSentinelConfig);
    await t.expect(myRedisDatabasePage.hostPort.textContent).eql(`${ossSentinelConfig.sentinelHost}:${ossSentinelConfig.sentinelPort}`, 'The sentinel database is not in the list');
});
