import { commonUrl } from '../../../../helpers/conf';
import { SettingsPage, MyRedisDatabasePage } from '../../../../pageObjects';
import { Common } from '../../../../helpers/common';
import { rte } from '../../../../helpers/constants';
import { UserAgreementDialog } from '../../../../pageObjects/dialogs';

const userAgreementDialog = new UserAgreementDialog();
const myRedisDatabasePage = new MyRedisDatabasePage();
const settingsPage = new SettingsPage();

fixture `Agreements Verification`
    .meta({ type: 'critical_path', rte: rte.none })
    .page(commonUrl)
    .requestHooks(Common.mockSettingsResponse())
    .beforeEach(async t => {
        await t.maximizeWindow();
    });
test('Verify that user should accept User Agreements to continue working with the application', async t => {
    await t.expect(userAgreementDialog.userAgreementsPopup.exists).ok('User Agreements Popup is shown');
    // Verify that I still has agreements popup & cannot add a database
    await t.expect(userAgreementDialog.submitButton.hasAttribute('disabled')).ok('Submit button not disabled by default');
    await t.expect(myRedisDatabasePage.AddRedisDatabaseDialog.customSettingsButton.exists).notOk('User can\'t add a database');
});
test('Verify that the encryption enabled by default', async t => {
    // Verify that encryption enabled by default
    await t.expect(userAgreementDialog.switchOptionEncryption.withAttribute('aria-checked', 'true').exists).ok('Encryption enabled by default');
});
test('Verify that when user checks "Use recommended settings" option on EULA screen, all options (except Licence Terms) are checked', async t => {
    // Verify options unchecked before enabling Use recommended settings
    await t.expect(await settingsPage.getAnalyticsSwitcherValue()).notOk('Enable Analytics switcher is checked');
    await t.expect(await settingsPage.getNotificationsSwitcherValue()).notOk('Enable Notifications switcher is checked');
    // Check Use recommended settings switcher
    await t.click(userAgreementDialog.recommendedSwitcher);
    // Verify options checked after enabling Use recommended settings
    await t.expect(await settingsPage.getAnalyticsSwitcherValue()).ok('Enable Analytics switcher is unchecked');
    await t.expect(await settingsPage.getNotificationsSwitcherValue()).ok('Enable Notifications switcher is unchecked');
    await t.expect(await settingsPage.getEulaSwitcherValue()).notOk('EULA switcher is checked');
    // Uncheck Use recommended settings switcher
    await t.click(userAgreementDialog.recommendedSwitcher);
    // Verify that when user unchecks "Use recommended settings" option on EULA screen, previous state of checkboxes for the options is applied
    await t.expect(await settingsPage.getAnalyticsSwitcherValue()).notOk('Enable Analytics switcher is checked');
    await t.expect(await settingsPage.getNotificationsSwitcherValue()).notOk('Enable Notifications switcher is checked');
    await t.expect(await settingsPage.getEulaSwitcherValue()).notOk('EULA switcher is checked');
});
test('Verify that if "Use recommended settings" is selected, and user unchecks any of the option, "Use recommended settings" is unchecked', async t => {
    // Check Use recommended settings switcher
    await t.click(userAgreementDialog.recommendedSwitcher);
    // Verify Use recommended settings switcher unchecked after unchecking analytics switcher
    await t.click(settingsPage.switchAnalyticsOption);
    await t.expect(await userAgreementDialog.getRecommendedSwitcherValue()).eql('false', 'Use recommended settings switcher is still checked');
    // Check Use recommended settings switcher
    await t.click(userAgreementDialog.recommendedSwitcher);
    // Verify Use recommended settings switcher unchecked after unchecking notifications switcher
    await t.click(settingsPage.switchNotificationsOption);
    await t.expect(await userAgreementDialog.getRecommendedSwitcherValue()).eql('false', 'Use recommended settings switcher is still checked');
});
