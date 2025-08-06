import { Locator, Page, expect } from '@playwright/test'

export class BasePage {
    page: Page

    constructor(page: Page) {
        this.page = page
    }

    async reload(): Promise<void> {
        await this.page.reload()
    }

    async navigateTo(url: string): Promise<void> {
        await this.page.goto(url)
    }

    async navigateToHomeUrl(): Promise<void> {
        await this.page.goto('/')
    }

    async click(locator: Locator): Promise<void> {
        await locator.click()
    }

    async fill(selector: string, value: string): Promise<void> {
        await this.page.fill(selector, value)
    }

    async getText(locator: Locator): Promise<string | null> {
        return locator.textContent()
    }

    async isVisible(selctor: string): Promise<boolean> {
        return this.page.locator(selctor).isVisible()
    }

    async getByTestId(testId: string): Promise<Locator> {
        return this.page.getByTestId(testId)
    }

    async waitForLocatorVisible(locator: Locator, timeout = 6000) {
        await expect(locator).toBeVisible({ timeout })
    }

    async waitForLocatorNotVisible(locator: Locator, timeout = 6000) {
        await expect(locator).not.toBeVisible({ timeout })
    }

    async goBackHistor(): Promise<void> {
        await this.page.goBack()
    }

    async elementExistsSelector(selector: string): Promise<boolean> {
        const count = await this.page.locator(selector).count()
        return count > 0
    }

    async elementExistsLocator(locator: Locator): Promise<boolean> {
        const count = await locator.count()
        return count > 0
    }
}
