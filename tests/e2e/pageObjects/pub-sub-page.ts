import { t, Selector } from 'testcafe';
import { InstancePage } from './instance-page';

export class PubSubPage extends InstancePage {
    //CSS Selectors
    cssSelectorMessage = '[data-testid="messages-list"] tr';
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //COMPONENTS
    subscribeStatus = Selector('[data-testid=subscribe-status-text]');
    messages = Selector('[data-testid="messages-list"] tr');
    messagesTable = Selector('[data-testid="messages-list"] table]')
    messagesTableBottomNav = Selector('[data-testid="messages-list"] nav[data-role=pagination]')
    messagesTableFirstPageBtn = Selector('[data-testid="messages-list"] nav[data-role=pagination] button[title="First page"]')
    messagesTableLastPageBtn = Selector('[data-testid="messages-list"] nav[data-role=pagination] button[title="Last page"]')
    totalMessagesCount = Selector('[data-testid=pub-sub-messages-count]');
    pubSubPageContainer = Selector('[data-testid=pub-sub-page]');
    clientBadge = Selector('[data-testid=affected-clients-badge]');
    clearButtonTooltip = Selector('[data-radix-popper-content-wrapper]');
    ossClusterEmptyMessage = Selector('[data-testid=empty-messages-list-cluster]');
    //BUTTONS
    subscribeButton = Selector('[data-testid=subscribe-btn]').withText('Subscribe');
    unsubscribeButton = Selector('[data-testid=subscribe-btn]');
    publishButton = Selector('[data-testid=publish-message-submit]');
    clearPubSubButton = Selector('[data-testid=clear-pubsub-btn]');
    scrollDownButton = Selector('[data-testid=messages-list-anchor-btn]');
    //INPUTS
    channelNameInput = Selector('[data-testid=field-channel-name]');
    messageInput = Selector('[data-testid=field-message]');
    channelsSubscribeInput = Selector('[data-testid=channels-input]');

    patternsCount = Selector('[data-testid=patterns-count]');
    messageCount = Selector('[data-testid=pub-sub-messages-count]');

    /**
     * Publish message in pubsub
     * @param channel The name of channel
     * @param message The message
     */
    async publishMessage(channel: string, message: string): Promise<void> {
        await t.click(this.channelNameInput);
        await t.typeText(this.channelNameInput, channel, { replace: true, paste: true });
        await t.click(this.messageInput);
        await t.typeText(this.messageInput, message, { replace: true, paste: true });
        await t.click(this.publishButton);
    }

    /**
     * Subscribe to channel and publish message in pubsub
     * @param channel The name of channel
     * @param message The message
     */
    async subsribeToChannelAndPublishMessage(channel: string, message: string): Promise<void> {
        await t.click(this.subscribeButton);
        // Wait for pubsub loading
        await t.wait(1000);
        await this.publishMessage(channel, message);
        await t.expect((this.pubSubPageContainer.find('[data-testid^=row]').withText('message')).exists).ok('Message is not displayed');
    }
}
