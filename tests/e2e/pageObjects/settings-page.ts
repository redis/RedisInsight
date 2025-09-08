import { Selector, t } from 'testcafe';
import { BasePage } from './base-page';

export class SettingsPage extends BasePage {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //BUTTONS
    accordionAppearance = Selector('[data-test-subj=accordion-appearance]');
    accordionPrivacySettings = Selector('[data-test-subj=accordion-privacy-settings]');
    accordionAdvancedSettings = Selector('[data-test-subj=accordion-advanced-settings]');
    accordionWorkbenchSettings = Selector('[data-testid=accordion-workbench-settings]');
    switchAnalyticsOption = Selector('[data-testid=switch-option-analytics]');
    switchEulaOption = Selector('[data-testid=switch-option-eula]');
    submitConsentsPopupButton = Selector('[data-testid=consents-settings-popup] [data-testid=btn-submit]');
    switchNotificationsOption = Selector('[data-testid=switch-option-notifications]');
    switchEditorCleanupOption = Selector('[data-testid=switch-workbench-cleanup]');
    //TEXT INPUTS (also referred to as 'Text fields')
    keysToScanValue = Selector('[data-testid=keys-to-scan-value]');
    keysToScanInput = Selector('[data-testid=keys-to-scan-input]');
    commandsInPipelineValue = Selector('[data-testid=pipeline-bunch-value]');
    commandsInPipelineInput = Selector('[data-testid=pipeline-bunch-input]');
    pipelineLink = Selector('[data-testid=pipelining-link]');

    //Date and Time Format
    selectFormatDropdown = Selector('[data-test-subj=select-datetime]');
    selectTimezoneDropdown = Selector('[data-test-subj=select-timezone]');
    dataPreview = Selector('[data-testid=data-preview]');
    customRadioButton = Selector('[data-testid=format-timestamp-form-radio-group] button[value=custom]');
    commonRadioButton = Selector('[data-testid=format-timestamp-form-radio-group] button[value=common]');
    customTextField =  Selector('[data-testid=custom-datetime-input]');
    saveCustomFormatButton = Selector('[data-testid=datetime-custom-btn]');

    getDateTimeOption = (option: string): Selector =>
        Selector(`[data-test-subj^=date-option-${option}]`);
    getZoneOption = (option: string): Selector =>
        Selector(`[data-test-subj=zone-option-${option}]`);

    /**
     * Change Keys to Scan value
     * @param value Value for scan
     */
    async changeKeysToScanValue(value: string): Promise<void> {
        await t
            .hover(this.keysToScanValue)
            .click(this.keysToScanInput)
            .typeText(this.keysToScanInput, value, { replace: true, paste: true })
            .click(this.EditorButton.applyBtn);
    }

    /**
    * Change Commands In Pipeline value
    * @param value Value for pipeline
    */
    async changeCommandsInPipeline(value: string): Promise<void> {
        await t.hover(this.commandsInPipelineValue)
            .click(this.commandsInPipelineInput)
            .typeText(this.commandsInPipelineInput, value, { replace: true, paste: true })
            .click(this.EditorButton.applyBtn);
    }

    /**
     * Get state of Analytics switcher
     */
    async getAnalyticsSwitcherValue(): Promise<boolean> {
        return await this.switchAnalyticsOption.getAttribute('aria-checked') === 'true';
    }

    /**
     * Get state of Notifications switcher
     */
    async getNotificationsSwitcherValue(): Promise<boolean> {
        return await this.switchNotificationsOption.getAttribute('aria-checked') === 'true';
    }

    /**
     * Get state of Eula switcher
     */
    async getEulaSwitcherValue(): Promise<boolean> {
        return await this.switchEulaOption.getAttribute('aria-checked') === 'true';
    }

    /**
     * Get state of Editor Cleanup switcher
     */
    async getEditorCleanupSwitcherValue(): Promise<boolean> {
        return await this.switchEditorCleanupOption.getAttribute('aria-checked')  === 'true';
    }

    /**
    * Enable Editor Cleanup switcher
    * @param state Enabled(true) or disabled(false)
    */
    async changeEditorCleanupSwitcher(state: boolean): Promise<void> {
        const currentState = await this.getEditorCleanupSwitcherValue();
        if (currentState !== state) {
            await t.click(this.switchEditorCleanupOption);
        }
    }

    /**
     * Turn on/off notifications in Settings
     */
    async changeNotificationsSwitcher(toValue: boolean): Promise<void> {
        await t.click(this.NavigationPanel.settingsButton);
        await t.click(this.accordionAppearance);
        if (toValue !== await this.getNotificationsSwitcherValue()) {
            await t.click(this.switchNotificationsOption);
        }
    }

    /**
     * Turn on/off Analytics in Settings
     */
    async changeAnalyticsSwitcher(toValue: boolean): Promise<void> {
        await t.click(this.accordionPrivacySettings);
        if (toValue !== await this.getAnalyticsSwitcherValue()) {
            await t.click(this.switchAnalyticsOption);
        }
    }

    /**
     * Select data time option in Settings
     */
    async selectDataFormatDropdown(value: string): Promise<void>{
        await t.click(this.selectFormatDropdown);
        await t.click(this.getDateTimeOption(value));
    }

    /**
     * Select timezone option in Settings
     */
    async selectTimeZoneDropdown(value: string): Promise<void>{
        await t.click(this.selectTimezoneDropdown);
        await t.click(this.getZoneOption(value));
    }
    /**
     * Enter text in custom field Select timezone option in Settings
     */
    async enterTextInCustom(command: string): Promise<void>{
        await t.typeText(this.customTextField, command, { replace: true });
    }
}
