import { Locator, Page } from '@playwright/test'
import { BasePage } from '../../base-page'
import { ToastSelectors } from '../../../selectors'

export class Toast extends BasePage {
    // Deprecated - use new toast selectors below
    // TODO: Remove deprecated selectors and usages after migrating all toasts
    public readonly toastHeader: Locator

    public readonly toastBody: Locator

    public readonly toastSuccess: Locator

    public readonly toastError: Locator

    public readonly toastCloseButton: Locator

    public readonly toastSubmitBtn: Locator

    public readonly toastCancelBtn: Locator

    // New toast selectors
    public readonly toastContainer: Locator

    public readonly toastMessage: Locator

    public readonly toastDescription: Locator

    public readonly toastActionButton: Locator

    constructor(page: Page) {
        super(page)
        this.toastHeader = page.locator(ToastSelectors.toastHeader)
        this.toastBody = page.locator(ToastSelectors.toastBody)
        this.toastSuccess = page.locator(ToastSelectors.toastSuccess)
        this.toastError = page.locator(ToastSelectors.toastError)
        this.toastCloseButton = page.locator(ToastSelectors.toastCloseButton)
        this.toastSubmitBtn = page.getByTestId(ToastSelectors.toastSubmitBtn)
        this.toastCancelBtn = page.getByTestId(ToastSelectors.toastCancelBtn)

        // New toast selectors
        this.toastContainer = page.locator(ToastSelectors.toastContainer)
        this.toastMessage = page.locator(ToastSelectors.toastMessage)
        this.toastDescription = page.locator(ToastSelectors.toastDescription)
        this.toastActionButton = page.locator(ToastSelectors.toastActionButton)
    }

    async isCloseButtonVisible(): Promise<boolean> {
        return this.isVisible(ToastSelectors.toastCloseButton)
    }

    async closeToast(): Promise<void> {
        await this.toastActionButton.click()
    }
}
