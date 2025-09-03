/* eslint-disable @typescript-eslint/lines-between-class-members */
import { Locator, Page } from '@playwright/test'

import { BasePage } from '../../base-page'

export class CreateIndexPage extends BasePage {
    // CONTAINERS
    public readonly vectorSearchPage: Locator
    public readonly createIndexPage: Locator
    public readonly wizardTitle: Locator

    constructor(page: Page) {
        super(page)
        this.page = page

        // CONTAINERS
        this.vectorSearchPage = page.getByTestId('vector-search-page')
        this.createIndexPage = page.getByTestId(
            'vector-search--create-index-page',
        )
        this.wizardTitle = page.getByText('New vector search')
    }

    async verifyCreateIndexPageLoaded(): Promise<void> {
        await this.waitForLocatorVisible(this.createIndexPage)
        await this.waitForLocatorVisible(this.wizardTitle)
    }
}
