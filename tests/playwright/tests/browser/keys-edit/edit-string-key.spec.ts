import { faker } from '@faker-js/faker'

import { BrowserPage } from '../../../pageObjects/browser-page'
import { test, expect } from '../../../fixtures/test'
import { ossStandaloneConfig } from '../../../helpers/conf'
import {
    addStandaloneInstanceAndNavigateToIt,
    navigateToStandaloneInstance,
} from '../../../helpers/utils'

test.describe('Browser - Edit Key Operations - String Key Editing', () => {
    let browserPage: BrowserPage
    let keyName: string
    let cleanupInstance: () => Promise<void>

    test.beforeEach(async ({ page, api: { databaseService } }) => {
        browserPage = new BrowserPage(page)
        keyName = faker.string.alphanumeric(10)
        cleanupInstance = await addStandaloneInstanceAndNavigateToIt(
            page,
            databaseService,
        )

        await navigateToStandaloneInstance(page)
    })

    test.afterEach(async ({ api: { keyService } }) => {
        // Clean up: delete the key if it exists
        try {
            await keyService.deleteKeyByNameApi(
                keyName,
                ossStandaloneConfig.databaseName,
            )
        } catch (error) {
            // Key might already be deleted in test, ignore error
        }

        await cleanupInstance()
    })

    test('should edit string key value successfully', async ({
        api: { keyService },
    }) => {
        // Arrange: Create a string key
        const originalValue = faker.lorem.words(3)
        const newValue = faker.lorem.words(4)

        await keyService.addStringKeyApi(
            { keyName, value: originalValue },
            ossStandaloneConfig,
        )

        // Open key details and verify original value
        await browserPage.searchByKeyName(keyName)
        await browserPage.openKeyDetailsByKeyName(keyName)

        const displayedOriginalValue = await browserPage.getStringKeyValue()
        expect(displayedOriginalValue).toContain(originalValue)

        // Edit the key value
        await browserPage.editStringKeyValue(newValue)

        // Wait for value and length to update
        await browserPage.waitForStringValueToUpdate(newValue)
        await browserPage.waitForKeyLengthToUpdate(newValue.length.toString())
    })

    test('should cancel string key value edit operation', async ({
        api: { keyService },
    }) => {
        // Arrange: Create a string key
        const originalValue = faker.lorem.words(3)
        const attemptedNewValue = faker.lorem.words(4)

        await keyService.addStringKeyApi(
            { keyName, value: originalValue },
            ossStandaloneConfig,
        )

        // Open key details and verify original value
        await browserPage.searchByKeyName(keyName)
        await browserPage.openKeyDetailsByKeyName(keyName)

        const displayedOriginalValue = await browserPage.getStringKeyValue()
        expect(displayedOriginalValue).toContain(originalValue)

        // Start editing but cancel
        await browserPage.cancelStringKeyValueEdit(attemptedNewValue)

        // Verify the original value is still displayed
        const displayedValueAfterCancel = await browserPage.getStringKeyValue()
        expect(displayedValueAfterCancel).toContain(originalValue)
        expect(displayedValueAfterCancel).not.toContain(attemptedNewValue)
    })
})
