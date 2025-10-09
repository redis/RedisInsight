import { Selector, t } from 'testcafe';
import { InstancePage } from './instance-page';

export class SlowLogPage extends InstancePage {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //CSS Selectors
    cssSelectorDurationValue = '[data-testid=duration-value]';
    //BUTTONS
    slowLogSortByTimestamp = Selector('[data-testid=header-sorting-button]');
    slowLogNumberOfCommandsDropdown = Selector('[data-testid=count-select]');
    slowLogConfigureButton = Selector('[data-testid=configure-btn]');
    slowLogConfigureUnitButton = Selector('[data-test-subj=select-default-unit]');
    slowLogConfigureMilliSecondsUnit = Selector('[data-test-subj=unit-milli-second]');
    slowLogConfigureMicroSecondsUnit = Selector('[data-test-subj=unit-micro-second]');
    slowLogSaveConfigureButton = Selector('[data-testid=slowlog-config-save-btn]');
    slowLogCancelConfigureButton = Selector('[data-testid=slowlog-config-cancel-btn]');
    slowLogDefaultConfigureButton = Selector('[data-testid=slowlog-config-default-btn]');
    slowLogRefreshButton = Selector('[data-testid=slowlog-refresh-btn]');
    slowLogClearButton = Selector('[data-testid=clear-btn]');
    slowLogConfirmClearButton = Selector('[data-testid=reset-confirm-btn]');
    slowLogTab = Selector('[data-testid=analytics-tabs] [role=tab] p').withText('Slow Log').parent('[role=tab]');
    //INPUTS
    slowLogSlowerThanConfig = Selector('[data-testid=slower-than-input]');
    slowLogMaxLengthConfig = Selector('[data-testid=max-len-input]');
    //TEXT ELEMENTS
    slowLogTimestampValue = Selector('[data-testid=timestamp-value]');
    slowLogDurationValue = Selector(this.cssSelectorDurationValue);
    slowLogCommandValue = Selector('[data-testid=command-value]');
    slowLogEmptyResult = Selector('[data-testid=empty-slow-log]');
    slowLogCommandStatistics = Selector('[data-testid=entries-from-timestamp]');
    configInfo = Selector('[data-testid=config-info]');
    // Table
    slowLogTable = Selector('[data-testid=slowlog-table]');

    /**
     * Set value for slowlog-log-slower-than parameter
     * @param slowerThan Value for slowlog-log-slower-than property
     * @param unit Value for unit property
     */
    async changeSlowerThanParameter(slowerThan: number, unit?: Selector): Promise<void> {
        await t
            .click(this.slowLogConfigureButton)
            .typeText(this.slowLogSlowerThanConfig, slowerThan.toString(), { replace: true, paste: true });
        if (unit !== undefined) {
            await t
                .click(this.slowLogConfigureUnitButton)
                .click(unit);
        }
        await t.click(this.slowLogSaveConfigureButton);
    }

    /**
     * Set value for slowlog-max-len parameter
     * @param maxLength Value for slowlog-max-len property
     */
    async changeMaxLengthParameter(maxLength: number): Promise<void> {
        await t
            .click(this.slowLogConfigureButton)
            .typeText(this.slowLogMaxLengthConfig, maxLength.toString(), { replace: true, paste: true })
            .click(this.slowLogSaveConfigureButton);
    }

    /**
     * Change Display Up To parameter in Slow Log
     * @param option option for commands to display
     */
    async changeDisplayUpToParameter(option: string): Promise<void> {
        await t.click(this.slowLogNumberOfCommandsDropdown);
        await t.click(Selector('[role=listbox] [role=option] span').withText(`${option}`));
    }

    /**
     * Reset max-length and slowlog-log-slower-than to default
     */
    async resetToDefaultConfig(): Promise<void> {
        await t
            .click(this.slowLogConfigureButton)
            .click(this.slowLogDefaultConfigureButton)
            .click(this.slowLogSaveConfigureButton);
    }
}
