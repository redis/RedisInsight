import { faker } from '@faker-js/faker'

import { BrowserPage } from '../../../pageObjects/browser-page'
import { test, expect } from '../../../fixtures/test'
import { ossStandaloneConfig } from '../../../helpers/conf'
import {
    addStandaloneInstanceAndNavigateToIt,
    navigateToStandaloneInstance,
} from '../../../helpers/utils'

test.describe('Browser - Edit Key Operations - Hash Key Editing', () => {
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

    test('should edit hash field value successfully', async ({
        api: { keyService },
    }) => {
        // Arrange: Create a hash key with a field
        const fieldName = faker.string.alphanumeric(8)
        const originalValue = faker.lorem.words(3)
        const newValue = faker.lorem.words(4)

        await keyService.addHashKeyApi(
            {
                keyName,
                fields: [{ field: fieldName, value: originalValue }],
            },
            ossStandaloneConfig,
        )

        // Open key details and wait for hash to load
        await browserPage.searchByKeyName(keyName)
        await browserPage.openKeyDetailsByKeyName(keyName)

        // Wait for field to be visible and verify original value
        await browserPage.waitForHashFieldToBeVisible(fieldName)
        await browserPage.verifyHashFieldValue(fieldName, originalValue)

        // Edit the hash field value
        await browserPage.editHashFieldValue(fieldName, newValue)

        // Verify the value was updated
        await browserPage.verifyHashFieldValue(fieldName, newValue)
    })

    test('should cancel hash field value edit operation', async ({
        api: { keyService },
    }) => {
        // Arrange: Create a hash key with a field
        const fieldName = faker.string.alphanumeric(8)
        const originalValue = faker.lorem.words(3)
        const attemptedNewValue = faker.lorem.words(4)

        await keyService.addHashKeyApi(
            {
                keyName,
                fields: [{ field: fieldName, value: originalValue }],
            },
            ossStandaloneConfig,
        )

        // Open key details and wait for hash to load
        await browserPage.searchByKeyName(keyName)
        await browserPage.openKeyDetailsByKeyName(keyName)
        await browserPage.waitForHashDetailsToBeVisible()
        await browserPage.verifyHashFieldValue(fieldName, originalValue)

        // Start editing but cancel
        await browserPage.cancelHashFieldEdit(fieldName, attemptedNewValue)

        // Verify the original value is still present and attempted value is not
        await browserPage.verifyHashFieldValueContains(fieldName, originalValue)
        await browserPage.verifyHashFieldValueNotContains(
            fieldName,
            attemptedNewValue,
        )
    })

    test('should add new field to hash key successfully', async ({
        api: { keyService },
    }) => {
        // Arrange: Create a hash key with one field
        const existingFieldName = faker.string.alphanumeric(8)
        const existingFieldValue = faker.lorem.words(2)
        const newFieldName = faker.string.alphanumeric(8)
        const newFieldValue = faker.lorem.words(3)

        await keyService.addHashKeyApi(
            {
                keyName,
                fields: [
                    { field: existingFieldName, value: existingFieldValue },
                ],
            },
            ossStandaloneConfig,
        )

        // Open key details and verify initial state
        await browserPage.searchByKeyName(keyName)
        await browserPage.openKeyDetailsByKeyName(keyName)
        await browserPage.waitForHashDetailsToBeVisible()
        await browserPage.waitForKeyLengthToUpdate('1')

        // Add a new field
        await browserPage.addFieldToHash(newFieldName, newFieldValue)

        // Verify new field appears and length updates
        await browserPage.waitForHashFieldToBeVisible(newFieldName)
        await browserPage.verifyHashFieldValue(newFieldName, newFieldValue)
        await browserPage.waitForKeyLengthToUpdate('2')

        // Verify existing field still exists
        await browserPage.verifyHashFieldValue(
            existingFieldName,
            existingFieldValue,
        )
    })

    test('should remove hash field successfully', async ({
        api: { keyService },
    }) => {
        // Arrange: Create a hash key with multiple fields
        const field1Name = faker.string.alphanumeric(8)
        const field1Value = faker.lorem.words(2)
        const field2Name = faker.string.alphanumeric(8)
        const field2Value = faker.lorem.words(2)

        await keyService.addHashKeyApi(
            {
                keyName,
                fields: [
                    { field: field1Name, value: field1Value },
                    { field: field2Name, value: field2Value },
                ],
            },
            ossStandaloneConfig,
        )

        // Open key details and verify initial state
        await browserPage.searchByKeyName(keyName)
        await browserPage.openKeyDetailsByKeyName(keyName)
        await browserPage.waitForHashDetailsToBeVisible()
        await browserPage.waitForKeyLengthToUpdate('2')

        // Remove the first field
        await browserPage.removeHashField(field1Name)

        // Verify field was removed and length updated
        await browserPage.waitForKeyLengthToUpdate('1')
        await browserPage.verifyHashFieldNotVisible(field1Name)

        // Verify other field still exists and key is still open
        await browserPage.verifyHashFieldValue(field2Name, field2Value)
        const keyStillExists = await browserPage.isKeyDetailsOpen(keyName)
        expect(keyStillExists).toBe(true)
    })
})
