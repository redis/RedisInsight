import { expect, Page } from '@playwright/test'

import { DatabaseAPIRequests } from './api/api-databases'
import { ossStandaloneConfig } from './conf'
import { AddNewDatabaseParameters } from '../types/databases'

export async function addStandaloneInstanceAndNavigateToIt(
    page: Page,
    databaseService: DatabaseAPIRequests,
    config: AddNewDatabaseParameters = ossStandaloneConfig,
): Promise<() => Promise<void>> {
    // Add a new standalone database
    databaseService.addNewStandaloneDatabaseApi(config)

    page.reload()

    return async function cleanup() {
        try {
            await databaseService.deleteStandaloneDatabaseApi(config)
        } catch (error) {
            console.warn('Error during cleanup:', error)
        }
    }
}

export async function navigateToStandaloneInstance(
    page: Page,
    config: AddNewDatabaseParameters = ossStandaloneConfig,
): Promise<void> {
    // Click on the added database
    const dbItems = page.locator('[data-testid^="instance-name"]')
    const db = dbItems.filter({
        hasText: config.databaseName?.trim(),
    })
    await expect(db).toBeVisible({ timeout: 5000 })
    await db.first().click()
}

export function stringToBuffer(str: string): Buffer {
    return Buffer.from(str, 'utf-8')
}
