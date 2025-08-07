import { Page, Locator } from '@playwright/test'
import { BasePage } from './base-page'

export class AutoDiscoverREDatabases extends BasePage {
    // BUTTONS
    readonly addSelectedDatabases: Locator

    readonly databaseCheckbox: Locator

    readonly search: Locator

    readonly viewDatabasesButton: Locator

    // TEXT INPUTS
    readonly title: Locator

    readonly databaseName: Locator

    constructor(page: Page) {
        super(page)
        this.page = page
        this.addSelectedDatabases = page.getByTestId('btn-add-databases')
        this.databaseCheckbox = page.locator(
            '[data-test-subj^="checkboxSelectRow"]',
        )
        this.search = page.getByTestId('search')
        this.viewDatabasesButton = page.getByTestId('btn-view-databases')
        this.title = page.getByTestId('title')
        this.databaseName = page.locator('[data-testid^="db_name_"]')
    }

    // Get databases name
    async getDatabaseName(): Promise<string | null> {
        return this.databaseName.textContent()
    }
}
