import { Selector, t } from 'testcafe';
import { ExploreTabs } from '../../helpers/constants';
import { RecommendationsTab } from './recommendations-tab';
import { ExploreTab } from './explore-tab';

export class InsightsPanel {
    // CONTAINERS
    sidePanel = Selector('[data-testid=side-panels-insights]');
    closeButton = Selector('[data-testid=close-insights-btn]');
    activeTab = this.sidePanel.find('[data-testid=insights-tabs] [data-state=active]');

    recommendationsTab = Selector('[data-testid=recommendations-tab]');
    exploreTab = this.sidePanel.find('[role=tablist] span').withExactText('Tutorials').parent('[role=tab]');
    copilotTab = Selector('[data-testid=ai-assistant-tab]');

    existsCompatibilityPopover = Selector('[data-testid=explore-capability-popover]');

    activeTabMask = '[data-testid=insights-tabs] [data-state=active]';

    /**
     * get active tab
     */
    async getActiveTabName(): Promise<string> {
        return (this.sidePanel.find(this.activeTabMask)).textContent;
    }

    /**
     * Click on Panel tab
     * @param type of the tab
     */
    async setActiveTab(type: ExploreTabs.Tutorials): Promise<ExploreTab>
    async setActiveTab(type: ExploreTabs.Tips): Promise<RecommendationsTab>
    async setActiveTab(type: ExploreTabs): Promise<ExploreTab | RecommendationsTab> {
        const activeTabName  = await this.getActiveTabName();
        if(type === ExploreTabs.Tutorials) {
            if(type !== activeTabName) {
                await t.click(this.exploreTab);
            }
            return new ExploreTab();
        }

        if(type !== activeTabName) {
            await t.click(this.recommendationsTab);
        }
        return new RecommendationsTab();

    }

    /**
     * Get Insights panel selector
     */
    getInsightsPanel(): Selector {
        return Selector('[class=euiButton__text]').withExactText(ExploreTabs.Tips);
    }
}
