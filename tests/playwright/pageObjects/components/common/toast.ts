import { Locator, Page } from '@playwright/test'
import { BasePage } from '../../base-page'
import { ToastSelectors } from '../../../selectors'

export class Toast extends BasePage {
    public readonly toastHeader: Locator

    public readonly toastBody: Locator

    public readonly toastSuccess: Locator

    public readonly toastError: Locator

    public readonly toastCloseButton: Locator

    public readonly toastSubmitBtn: Locator

    public readonly toastCancelBtn: Locator

    constructor(page: Page) {
        super(page)
        this.toastHeader = page.locator(ToastSelectors.toastHeader)
        this.toastBody = page.locator(ToastSelectors.toastBody)
        this.toastSuccess = page.locator(ToastSelectors.toastSuccess)
        this.toastError = page.locator(ToastSelectors.toastError)
        this.toastCloseButton = page.locator(ToastSelectors.toastCloseButton)
        this.toastSubmitBtn = page.getByTestId(ToastSelectors.toastSubmitBtn)
        this.toastCancelBtn = page.getByTestId(ToastSelectors.toastCancelBtn)
    }

    async isCloseButtonVisible(): Promise<boolean> {
        return this.isVisible(ToastSelectors.toastCloseButton)
    }

    async closeToast(): Promise<void> {
        await this.toastCloseButton.click()
    }
}
