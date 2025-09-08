import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage, MyRedisDatabasePage, PubSubPage } from '../../../../pageObjects'
import { commonUrl, ossStandaloneConfig, ossClusterConfig } from '../../../../helpers/conf';
import { rte } from '../../../../helpers/constants';
import { verifyMessageDisplayingInPubSub } from '../../../../helpers/pub-sub';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const pubSubPage = new PubSubPage();
const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

fixture `PubSub OSS Cluster 7 tests`
    .meta({ type: 'regression' })
    .page(commonUrl)

    .beforeEach(async t => {
        await databaseHelper.acceptLicenseTerms();
        await databaseAPIRequests.addNewOSSClusterDatabaseApi(ossClusterConfig);
        await myRedisDatabasePage.reloadPage();
        await myRedisDatabasePage.clickOnDBByName(ossClusterConfig.ossClusterDatabaseName);
        await t.click(browserPage.NavigationTabs.pubSubButton);
    })
    .afterEach(async() => {
        await databaseAPIRequests.deleteOSSClusterDatabaseApi(ossClusterConfig);
    });
test

    .meta({ rte: rte.ossCluster })('Verify that SPUBLISH message is displayed for OSS Cluster 7 database', async t => {
        await t.expect(pubSubPage.ossClusterEmptyMessage.exists).ok('SPUBLISH message not displayed');
        // Verify that user can see published messages for OSS Cluster 7
        await t.click(pubSubPage.subscribeButton);
        // Publish different messages
        await pubSubPage.Cli.sendCommandInCli('50 publish channel oss_cluster_message');
        await verifyMessageDisplayingInPubSub('oss_cluster_message', true);
        // Verify that SPUBLISHED messages are not displayed for OSS Cluster 7
        await pubSubPage.Cli.sendCommandInCli('10 spublish channel oss_cluster_message_spublish');
        await verifyMessageDisplayingInPubSub('oss_cluster_message_spublish', false);
    });
test
    .before(async t => {
        await databaseHelper.acceptLicenseTerms();
        await databaseAPIRequests.addNewStandaloneDatabaseApi(ossStandaloneConfig);
        await myRedisDatabasePage.reloadPage();
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        await t.click(browserPage.NavigationTabs.pubSubButton);
    })
    .after(async() => {
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })
    .meta({ rte: rte.standalone })('Verify that SPUBLISH message is not displayed for other databases expect OSS Cluster 7', async t => {
        await t.expect(pubSubPage.ossClusterEmptyMessage.exists).notOk('No SPUBLISH message still displayed');
        // Verify that user can't see published messages for Standalone DB
        await t.click(pubSubPage.subscribeButton);
        await pubSubPage.Cli.sendCommandInCli('10 spublish channel oss_cluster_message_spublish');
        await verifyMessageDisplayingInPubSub('oss_cluster_message_spublish', false);
    });

test.meta({ rte: rte.ossCluster })('Verify that PSUBSCRIBE works, that user can specify channel name to subscribe', async t => {
    const channelsName = 'first second third';
    const namesList = channelsName.split(' ');

    await t.expect(pubSubPage.channelsSubscribeInput.value).eql('*', 'the default value is not set');
    await t.typeText(pubSubPage.channelsSubscribeInput, channelsName, { replace: true });
    await t.click(pubSubPage.subscribeButton);
    await t.expect(pubSubPage.channelsSubscribeInput.hasAttribute('disabled')).ok('the field is not disabled after subscribe');
    await pubSubPage.publishMessage(namesList[0], 'published message');
    await verifyMessageDisplayingInPubSub('published message', true);
    await pubSubPage.publishMessage(namesList[1], 'second message');
    await verifyMessageDisplayingInPubSub('second message', true);
    await pubSubPage.publishMessage('not exist', 'not exist message');
    await verifyMessageDisplayingInPubSub('not exist message', false);

    await t.expect(pubSubPage.patternsCount.textContent).contains(namesList.length.toString(), 'patterns count is not calculated correctly');
    await t.expect(pubSubPage.messageCount.textContent).contains('2', 'message count is not calculated correctly');
});
