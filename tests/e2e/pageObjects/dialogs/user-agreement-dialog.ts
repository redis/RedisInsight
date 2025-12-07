import { t, Selector } from 'testcafe';

export class UserAgreementDialog {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //COMPONENTS
    userAgreementsPopup = Selector('[data-testid=consents-settings-popup]');
    //BUTTONS
    submitButton = Selector('[data-testid=btn-submit]');
    switchOptionEula = Selector('[data-testid=switch-option-eula]');
    switchOptionEncryption = Selector('[data-testid=switch-option-encryption]');
    pluginSectionWithText = Selector('[data-testid=plugin-section]');
    recommendedSwitcher = Selector('[data-testid=switch-option-recommended]');

    //Accept Garnet Insight License Terms
    async acceptLicenseTerms(): Promise<void> {
        if (await this.switchOptionEula.exists) {
            await t
                .click(this.recommendedSwitcher)
                .click(this.switchOptionEula)
                .click(this.submitButton)
                .expect(this.userAgreementsPopup.exists).notOk('The user agreements popup is not shown', { timeout: 2000 });
        }
    }

    /**
     * Get state of Recommended switcher
     */
    async getRecommendedSwitcherValue(): Promise<string | null> {
        return await this.recommendedSwitcher.getAttribute('aria-checked');
    }
}
