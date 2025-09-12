import { Selector, t } from 'testcafe';

export class OnboardingCardsDialog {
    backButton = Selector('[data-testid=back-btn]');
    nextButton = Selector('[data-testid=next-btn]');
    showMeAroundButton = Selector('[data-testid=start-tour-btn]');
    skipTourButton = Selector('[data-testid=skip-tour-btn]');
    stepTitle = Selector('[data-testid=step-title]');
    wbOnbardingCommand = Selector('[data-testid=wb-onboarding-command]');
    copyCodeButton = Selector('[data-testid=copy-code-btn]');
    resetOnboardingBtn = Selector('[data-testid=reset-onboarding-btn]');

    /**
     * Verify onboarding step visible based on title
     * @param stepName title of the step
     */
    async verifyStepVisible(stepName: string): Promise<void> {
        await t.expect(this.stepTitle.withText(stepName).exists).ok(`${stepName} step is not visible`);
    }
    /**
     Click next step
     */
    async clickNextStep(): Promise<void> {
        await t.click(this.nextButton);
    }
    /**
     Click next step until the last step
     */
    async clickNextUntilLastStep(): Promise<void> {
        do {
            await this.clickNextStep();
        }
        while (await this.skipTourButton.visible);
    }
    /**
     Start onboarding process
     */
    async startOnboarding(): Promise<void> {
        await t.click(this.showMeAroundButton);
    }
    /**
     Complete onboarding process
     */
    async completeOnboarding(): Promise<void> {
        await t.expect(this.showMeAroundButton.exists).notOk('Show me around button still visible');
        await t.expect(this.stepTitle.exists).notOk('Onboarding tooltip still visible');
    }
    /**
     Click back step
     */
    async clickBackStep(): Promise<void> {
        await t.click(this.backButton);
    }
    /**
     Click skip tour step
     */
    async clickSkipTour(): Promise<void> {
        await t.click(this.skipTourButton);
    }
}
