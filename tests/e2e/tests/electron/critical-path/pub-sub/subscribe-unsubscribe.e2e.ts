import { DatabaseHelper } from '../../../../helpers/database';
import { MyRedisDatabasePage, PubSubPage } from '../../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { rte } from '../../../../helpers/constants';
import { verifyMessageDisplayingInPubSub } from '../../../../helpers/pub-sub';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const pubSubPage = new PubSubPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

fixture `Subscribe/Unsubscribe from a channel`
    .meta({ rte: rte.standalone, type: 'critical_path' })
    .page(commonUrl)
    .beforeEach(async t => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
        //Go to PubSub page
        await t.click(pubSubPage.NavigationTabs.pubSubButton);
    })
    .afterEach(async() => {
        await databaseAPIRequests.deleteAllDatabasesApi();
    });
test('Verify that when user subscribe to the pubsub channel he can see all the messages being published to my database from the moment of my subscription', async t => {
    // Verify that the Channel field placeholder is 'Enter Channel Name'
    await t.expect(pubSubPage.channelNameInput.getAttribute('placeholder')).eql('Enter Channel Name', 'No placeholder in Channel field');
    // Verify that the Message field placeholder is 'Enter Message'
    await t.expect(pubSubPage.messageInput.getAttribute('placeholder')).eql('Enter Message', 'No placeholder in Message field');
    // Verify that user is unsubscribed from the pubsub channel when he go to the pubsub window after launching application for the first time
    await t.expect(pubSubPage.subscribeStatus.textContent).eql('You are not subscribed', 'User is not unsubscribed');
    await t.expect(pubSubPage.subscribeButton.textContent).eql('Subscribe', 'Subscribe button is not displayed');

    // Subscribe to channel
    await t.click(pubSubPage.subscribeButton);
    await t.expect(pubSubPage.subscribeStatus.textContent).eql('You are  subscribed', 'User is not subscribed', { timeout: 10000 });
    // Verify that user can publish a message to a channel
    await pubSubPage.publishMessage('test', 'published message');
    await verifyMessageDisplayingInPubSub('published message', true);
    await t.click(pubSubPage.unsubscribeButton);
    //Verify that when user unsubscribe from a pubsub channel he can see no new data being published to the channel from the moment he unsubscribe
    await t.expect(pubSubPage.subscribeStatus.textContent).eql('You are not subscribed', 'User is not unsubscribed', { timeout: 10000 });
    //Verify that user can publish a message regardless of my subscription state.
    await pubSubPage.publishMessage('test', 'message in unsubscribed status');
    //Verify that message is not displayed
    await verifyMessageDisplayingInPubSub('message in unsubscribed status', false);
});
