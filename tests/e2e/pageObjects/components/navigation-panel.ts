import { Selector } from 'testcafe';

import { BaseNavigationPanel } from './navigation/base-navigation-panel';

export class NavigationPanel extends BaseNavigationPanel{
    settingsButton = Selector('[data-testid=settings-page-btn]');
}
