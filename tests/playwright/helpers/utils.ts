import { expect, Page } from '@playwright/test'

import { DatabaseAPIRequests } from './api/api-databases'
import { ossStandaloneConfig } from './conf'

export async function addStandaloneInstanceAndNavigateToIt(
    page: Page,
    databaseService: DatabaseAPIRequests,
): Promise<() => Promise<void>> {
    // Add a new standalone database
    databaseService.addNewStandaloneDatabaseApi(ossStandaloneConfig)

    page.reload()

    return async function cleanup() {
        try {
            await databaseService.deleteStandaloneDatabaseApi(
                ossStandaloneConfig,
            )
        } catch (error) {
            console.warn('Error during cleanup:', error)
        }
    }
}

export async function navigateToStandaloneInstance(page: Page): Promise<void> {
    // Click on the added database
    const dbItems = page.locator('[data-testid^="instance-name"]')
    const db = dbItems.filter({
        hasText: ossStandaloneConfig.databaseName.trim(),
    })
    await expect(db).toBeVisible({ timeout: 5000 })
    await db.first().click()
}

export function stringToBuffer(str: string): Buffer {
    return Buffer.from(str, 'utf-8')
}
