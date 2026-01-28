import { DatabaseHelper } from '../../../../helpers/database';
import { BrowserPage, MyRedisDatabasePage, PubSubPage } from '../../../../pageObjects'
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { rte } from '../../../../helpers/constants';
import { verifyMessageDisplayingInPubSub } from '../../../../helpers/pub-sub';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const pubSubPage = new PubSubPage();
const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

fixture.skip `PubSub debug mode`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async t => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
        // Go to PubSub page and subscribe to channel
        await t.click(browserPage.NavigationTabs.pubSubButton);
        await t.click(pubSubPage.subscribeButton);
        // Publish different messages
        await pubSubPage.Cli.sendCommandInCli('10 publish channel first');
        await pubSubPage.Cli.sendCommandInCli('10 publish channel second');
        await pubSubPage.Cli.sendCommandInCli('10 publish channel third');
    })
    .afterEach(async() => {
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });

test('Example of new test', async t => {
    // Shouldn't see message with text first on 1st table page
    await t.expect(pubSubPage.pubSubPageContainer.find(pubSubPage.cssSelectorMessage).withText('first').visible).notOk('Oldest message is shown on the first table page');
    // Navigate to last table page
    await t.click(pubSubPage.messagesTableLastPageBtn);
    // Should have the oldest messages on the last table page
    await t.expect(pubSubPage.pubSubPageContainer.find(pubSubPage.cssSelectorMessage).withText('first').visible).ok('Oldest message should be shown on the last table page');
    // Navigate to first table page
    await t.click(pubSubPage.messagesTableFirstPageBtn);

    // ...
})
test('Verify that when user navigating away and back to pubsub window the debug mode state will be reset to default auto-scroll', async t => {
    // Scroll to the first messages
    await t.scrollIntoView(pubSubPage.pubSubPageContainer.find(pubSubPage.cssSelectorMessage).withText('first'));
    // Verify that new messages keep arriving in the background and user can always see up to date count of total messages received.
    await pubSubPage.publishMessage('test', 'message sent in the background');
    await t.expect(pubSubPage.totalMessagesCount.textContent).contains('31', 'Total counter value is incorrect');
    // Verify that when user scroll away from the newest message the auto-scroll is stopped
    await pubSubPage.Cli.sendCommandInCli('30 publish channel additionalMessages');
    await pubSubPage.publishMessage('test', 'new message with no scroll');
    await verifyMessageDisplayingInPubSub('new message with no scroll', false);
    // Go to Browser Page
    await t.click(browserPage.NavigationTabs.browserButton);
    // Go to PubSub page
    await t.click(browserPage.NavigationTabs.pubSubButton);
    // Verify that the debug mode state is reset to default auto-scroll
    await verifyMessageDisplayingInPubSub('new message with no scroll', true);
});
test('Verify that when user scroll all the way to the newest available message (down), auto-scroll resumes automatically.', async t => {
    // Scroll to the first messages
    await t.scrollIntoView(pubSubPage.pubSubPageContainer.find(pubSubPage.cssSelectorMessage).withText('first'));
    await pubSubPage.publishMessage('test', 'message to scroll');
    await t.scrollIntoView(pubSubPage.pubSubPageContainer.find(pubSubPage.cssSelectorMessage).withText('message to scroll'));
    await pubSubPage.Cli.sendCommandInCli('20 publish channel fourth');
    // Verify auto-scroll resumes automatically
    await verifyMessageDisplayingInPubSub('fourth', true);
});
test('Verify that user can get to the newest message in one click', async t => {
    // Scroll to the first messages
    await t.scrollIntoView(pubSubPage.pubSubPageContainer.find(pubSubPage.cssSelectorMessage).withText('first'));
    await pubSubPage.publishMessage('test', 'new message');
    await t.click(pubSubPage.scrollDownButton);
    // Verify the user scrolled to the newest message
    await verifyMessageDisplayingInPubSub('new message', true);
});
