import { Selector } from 'testcafe';

import NotificationPanel from '././notification-panel';
import { HelpCenter } from './help-center';

export class BaseNavigationPanel {
    NotificationPanel = new NotificationPanel();
    HelpCenter  = new HelpCenter();

    myRedisDBButton = Selector('[data-testid=redis-logo-link]', { timeout: 1000 });
    notificationCenterButton = Selector('[data-testid=notification-menu-button]');

    settingsButton = Selector('[data-testid=settings-page-btn]');
    helpCenterButton = Selector('[data-testid=help-menu-button]');
    githubButton = Selector('[data-testid=github-repo-icon]');
    cloudButton = Selector('[data-testid=cloud-db-icon]');

    buttonsLocator = Selector('[aria-label="Main navigation"] button');

    /**
     * get buttons count
     */
    async getButtonsCount(): Promise<number> {
        return  await this.buttonsLocator.count;
    }
}
