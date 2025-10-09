import { Selector, t } from 'testcafe';
import { EditorButton } from './common/editorButton';

export class OverviewPanel {
    EditorButton = new EditorButton();
    // TEXT ELEMENTS
    overviewTotalKeys = Selector('[data-test-subj=overview-total-keys]');
    overviewTotalMemory = Selector('[data-test-subj=overview-total-memory]');
    overviewCpu = Selector('[data-test-subj=overview-cpu]');
    overviewConnectedClients = Selector('[data-test-subj=overview-connected-clients]');
    overviewCommandsSec = Selector('[data-test-subj=overview-commands-sec]');
    overviewSpinner = Selector('[class*=euiLoadingSpinner--medium]');
    // BUTTONS
    myRedisDBLink = Selector('[data-testid=my-redis-db-btn]', { timeout: 1000 });
    changeIndexBtn = Selector('[data-testid=change-index-btn]');
    databaseInfoIcon = Selector('[data-testid=db-info-icon]');
    autoRefreshArrow = Selector('[data-testid=auto-refresh-overview-auto-refresh-config-btn]');
    autoRefreshCheckbox = Selector('[data-testid=auto-refresh-overview-auto-refresh-switch]');
    // PANEL
    databaseInfoToolTip = Selector('[data-testid=db-info-tooltip]', { timeout: 2000 });
    // INPUTS
    changeIndexInput = Selector('[data-testid=change-index-input]');
    autoRefreshRateInput = Selector('[data-testid=auto-refresh-overview-refresh-rate]');
    inlineItemEditor = Selector('[data-testid=inline-item-editor]');

    /**
     * Change database index
     * @param dbIndex The index of logical database
     */
    async changeDbIndex(dbIndex: number): Promise<void> {
        await t.click(this.changeIndexBtn)
            .typeText(this.changeIndexInput, dbIndex.toString(), { replace: true, paste: true })
            .click(this.EditorButton.applyBtn)
            .expect(this.changeIndexBtn.textContent).contains(dbIndex.toString());
    }

    /**
     * Verify that definite database index selected
     * @param dbIndex The index of logical database
     */
    async verifyDbIndexSelected(dbIndex: number): Promise<void> {
        await t.expect(this.changeIndexBtn.textContent).contains(dbIndex.toString());
    }

    /**
     * wait for cpu is displayed
     */
    async waitForCpuIsCalculated(): Promise<void> {
        await t.expect(this.overviewSpinner.visible).notOk('cpu is not calculated, spinner is still displayed');
    }

     /**
     * set auto refresh rate
     * @param rate rate value
     */
    async setAutoRefreshValue(rate: string): Promise<void> {
        if(!(await this.autoRefreshRateInput.exists)){
            await t.click(this.autoRefreshArrow)
        }
        await t.click(this.autoRefreshRateInput);
        await t.typeText(this.inlineItemEditor, rate, { replace: true });
        await t.click(this.EditorButton.applyBtn);
    }
}
