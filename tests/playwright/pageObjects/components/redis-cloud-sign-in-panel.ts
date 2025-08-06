import { Locator, Page } from '@playwright/test'
import { BasePage } from '../base-page'

export class RedisCloudSigninPanel extends BasePage {
    readonly ssoOauthButton: Locator

    readonly ssoEmailInput: Locator

    readonly submitBtn: Locator

    readonly oauthAgreement: Locator

    readonly googleOauth: Locator

    readonly githubOauth: Locator

    readonly ssoOauth: Locator

    constructor(page: Page) {
        super(page)
        this.ssoOauthButton = page.getByTestId('sso-oauth')
        this.ssoEmailInput = page.getByTestId('sso-email')
        this.submitBtn = page.getByTestId('btn-submit')
        this.oauthAgreement = page.locator('[for="ouath-agreement"]')
        this.googleOauth = page.getByTestId('google-oauth')
        this.githubOauth = page.getByTestId('github-oauth')
        this.ssoOauth = page.getByTestId('sso-oauth')
    }
}
