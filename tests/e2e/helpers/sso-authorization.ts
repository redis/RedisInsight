import { connect } from 'puppeteer-real-browser'
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { samlUser, samlUserPassword } from './conf';
import { MyRedisDatabasePage, SsoAuthorizationPage } from '../pageObjects';
import { Common } from './common';
import { closeChrome, openChromeOnCi, saveOpenedChromeTabUrl } from './scripts/browser-scripts';
import { t } from 'testcafe';
import { AiChatBotPanel } from '../pageObjects/components/chatbot/ai-chatbot-panel';

export class SsoAuthorization {
    /**
     * Process SSO authorization using Puppeteer
     * @param urlToUse The url to process authorization
     * @param authorizationType The type of SSO authorization
     */
    static async processSSOPuppeteer(urlToUse: string, authorizationType: 'Google' | 'Github' | 'SAML'): Promise<void> {
        const ssoAuthorizationPage = new SsoAuthorizationPage();
        const { browser, page } = await connect({
            headless: false,
            args: [],
            customConfig: {},
            turnstile: true,
            connectOption: {},
            disableXvfb: true,
            ignoreAllFlags: false,
        })

        try {
            await ssoAuthorizationPage.signInUsingSso(authorizationType, page, urlToUse, samlUser, samlUserPassword);

            const currentUrl = page.url();
            const parts = currentUrl.split('?');
            const modifiedUrl = parts.length > 1 ? parts[1] : currentUrl;

            const protocol = 'garnetinsight://';
            const callbackUrl = 'cloud/oauth/callback';
            const redirectUrl = `${protocol}${callbackUrl}?${modifiedUrl}`;

            await this.openGarnetinsightWithDeeplink(redirectUrl);
        } catch (error) {
            console.error('Error during SSO:', error);
            // Take a screenshot if there's an error
            fs.mkdirSync('./report/screenshots/', { recursive: true });
            const screenshot = await page.screenshot();
            fs.writeFileSync(`./report/screenshots/puppeteer_screenshot_${Common.generateWord(5)}.png`, screenshot, 'base64');
            throw error;
        } finally {
            await browser.close();
        }
    }

    /**
     * Helper function for waiting for timeout
     */
    static async waitForTimeout(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Open Garnet Insight electron app using deeplink
     * @param redirectUrl The redirect url for deeplink
     */
    static async openGarnetinsightWithDeeplink(redirectUrl: string) {
        if (process.platform === 'linux') {
            console.log('redirectUrl: ', redirectUrl);
            exec(`xdg-open "${redirectUrl}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error('Error opening Garnet Insight on Linux:', error);
                    return;
                }
                console.log('Garnet Insight opened successfully:', stdout);
            });
        } else {
            const open = (await import('open')).default;
            await open(redirectUrl, { app: { name: 'Garnet Insight' } });
        }
    }

    /**
     * Sign in using SAML SSO
     * @param urlToUse The url to process authorization
     */
    static async signInThroughSamlSso(urlToUse: string): Promise<void> {
        const myRedisDatabasePage = new MyRedisDatabasePage();
        const aiChatBotPanel = new AiChatBotPanel();
        const logsWithUrlFilePath = path.join('test-data', 'chrome_logs.txt');

        await openChromeOnCi();
        await t.click(myRedisDatabasePage.NavigationHeader.copilotButton);
        await t.click(aiChatBotPanel.RedisCloudSigninPanel.oauthAgreement);
        await t.click(aiChatBotPanel.RedisCloudSigninPanel.ssoOauthButton);
        await t.typeText(aiChatBotPanel.RedisCloudSigninPanel.ssoEmailInput, samlUser, { replace: true, paste: true });
    
        await t.wait(2000);
        await t.click(aiChatBotPanel.RedisCloudSigninPanel.submitBtn);
        await saveOpenedChromeTabUrl(logsWithUrlFilePath);
    
        await t.wait(2000);
        urlToUse = await Common.readFileFromFolder(logsWithUrlFilePath);
        await t.expect(urlToUse).contains('authorize?');
        await closeChrome();
        await t.wait(2000);
        await this.processSSOPuppeteer(urlToUse, 'SAML');
        await t.expect(myRedisDatabasePage.NavigationHeader.cloudSignInButton.exists).notOk('Sign in button still displayed', { timeout: 10000 });
        await myRedisDatabasePage.reloadPage();
        await t.expect(myRedisDatabasePage.userProfileBtn.exists).ok('User profile button not displayed');
    }
}
