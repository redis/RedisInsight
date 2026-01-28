import { t, Selector } from 'testcafe';
import { InsightsPanel } from '../insights-panel';

export class NavigationHeader {
    insightsTriggerButton = Selector('[data-testid=insights-trigger]');
    cloudSignInButton = Selector('[data-testid=cloud-sign-in-btn]');
    copilotButton = Selector('[data-testid=copilot-trigger]');
    dbName = Selector('[data-testid=nav-instance-popover-btn]');
    dbNameExactText = Selector('[data-testid=nav-instance-popover-btn] p');
    homeLinkNavigation = Selector('[class*=homePageLink]');
    dbListInstance = Selector('[data-testid^=instance-item-]');
    rdiNavigationTab = Selector('[role=tab][id*="Redis Data Integration"]');
    dbListInput = Selector('[data-testid=instances-nav-popover-search]');

    /**
     * Open/Close  Panel
     * @param state State of panel
     */
    async togglePanel(state: boolean): Promise<void> {
        const isPanelExists = await (new InsightsPanel()).sidePanel.exists;

        if (state !== isPanelExists) {
            await t.click(this.insightsTriggerButton);
        }
    }

    /**
     * Get all databases from List of DBs page
     */
    async getAllDatabases(): Promise<string[]> {
        const databases: string[] = [];
        const n = await this.dbListInstance.count;

        for(let k = 0; k < n; k++) {
            const name = await this.dbListInstance.nth(k).textContent;
            databases.push(name);
        }
        return databases;
    }
}
