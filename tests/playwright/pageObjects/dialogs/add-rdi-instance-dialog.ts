import { Page, Locator } from '@playwright/test'
import { BasePage } from '../base-page'

export class AddRdiInstanceDialog extends BasePage {
    // INPUTS
    readonly rdiAliasInput: Locator

    readonly urlInput: Locator

    readonly usernameInput: Locator

    readonly passwordInput: Locator

    // BUTTONS
    readonly addInstanceButton: Locator

    readonly cancelInstanceBtn: Locator

    readonly connectToRdiForm: Locator

    // ICONS
    readonly urlInputInfoIcon: Locator

    readonly usernameInputInfoIcon: Locator

    readonly passwordInputInfoIcon: Locator

    constructor(page: Page) {
        super(page)
        this.page = page
        this.rdiAliasInput = page.getByTestId('connection-form-name-input')
        this.urlInput = page.getByTestId('connection-form-url-input')
        this.usernameInput = page.getByTestId('connection-form-username-input')
        this.passwordInput = page.getByTestId('connection-form-password-input')

        this.addInstanceButton = page.getByTestId('connection-form-add-button')
        this.cancelInstanceBtn = page.getByTestId(
            'connection-form-cancel-button',
        )
        this.connectToRdiForm = page.getByTestId('connection-form')

        // Assuming that the two-level parent traversal is needed.
        // Using an XPath locator to navigate two ancestors then find an SVG element.
        this.urlInputInfoIcon = page
            .getByTestId('connection-form-url-input')
            .locator('xpath=ancestor::div[2]//svg')
        this.usernameInputInfoIcon = page
            .getByTestId('connection-form-username-input')
            .locator('xpath=ancestor::div[2]//svg')
        this.passwordInputInfoIcon = page
            .getByTestId('connection-form-password-input')
            .locator('xpath=ancestor::div[2]//svg')
    }
}
