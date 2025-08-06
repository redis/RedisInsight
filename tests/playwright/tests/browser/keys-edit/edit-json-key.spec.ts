import { faker } from '@faker-js/faker'

import { BrowserPage } from '../../../pageObjects/browser-page'
import { test } from '../../../fixtures/test'
import { ossStandaloneConfig } from '../../../helpers/conf'
import {
    addStandaloneInstanceAndNavigateToIt,
    navigateToStandaloneInstance,
} from '../../../helpers/utils'

test.describe('Browser - Edit JSON Key', () => {
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

    test('should edit JSON scalar values (string, number, boolean)', async ({
        api: { keyService },
    }) => {
        // Arrange
        const initialValue = {
            name: faker.person.firstName(),
            age: faker.number.int({ min: 7, max: 19 }),
            active: true,
            score: 87.5,
            count: 10,
        }
        const newName = faker.person.firstName()
        const newAge = faker.number.int({ min: 20, max: 90 })

        await keyService.addJsonKeyApi(
            { keyName, value: initialValue },
            ossStandaloneConfig,
        )

        // Act
        await browserPage.openKeyDetailsByKeyName(keyName)
        await browserPage.waitForJsonDetailsToBeVisible()

        // Edit string value
        await browserPage.editJsonString('name', newName)
        await browserPage.waitForJsonPropertyUpdate('name', newName)

        // Edit number values
        await browserPage.editJsonNumber('age', newAge)
        await browserPage.waitForJsonPropertyUpdate('age', newAge.toString())

        // Edit boolean value
        await browserPage.editJsonBoolean('active', false)
        await browserPage.waitForJsonPropertyUpdate('active', 'false')

        // Assert - verify all changes are applied and structure is valid
        await browserPage.verifyJsonStructureValid()
    })

    test('should cancel JSON scalar value edit', async ({
        api: { keyService },
    }) => {
        // Arrange
        const initialValue = {
            name: faker.person.firstName(),
            score: faker.number.int({ min: 1, max: 100 }),
        }

        await keyService.addJsonKeyApi(
            { keyName, value: initialValue },
            ossStandaloneConfig,
        )

        // Act
        await browserPage.openKeyDetailsByKeyName(keyName)
        await browserPage.waitForJsonDetailsToBeVisible()

        // Cancel the scalar value edit for the 'name' property
        await browserPage.cancelJsonScalarValueEdit('name')

        // Assert - original value should remain unchanged
        await browserPage.verifyJsonPropertyExists('name', initialValue.name)
    })

    test('should add new property to JSON object', async ({
        api: { keyService },
    }) => {
        // Arrange
        const initialValue = {
            name: faker.person.firstName(),
            age: faker.number.int({ min: 18, max: 80 }),
        }
        const newProperty = 'email'
        const newValue = faker.internet.email()

        await keyService.addJsonKeyApi(
            { keyName, value: initialValue },
            ossStandaloneConfig,
        )

        // Act
        await browserPage.openKeyDetailsByKeyName(keyName)
        await browserPage.waitForJsonDetailsToBeVisible()

        // Add a new property using clean API
        await browserPage.addJsonProperty(newProperty, newValue)

        // Assert
        await browserPage.waitForJsonPropertyUpdate(newProperty, newValue)

        // Verify original properties are still present
        await browserPage.verifyJsonPropertyExists('name', initialValue.name)
        await browserPage.verifyJsonPropertyExists(
            'age',
            initialValue.age.toString(),
        )

        // Verify key length increased
        const expectedLength = Object.keys(initialValue).length + 1
        await browserPage.verifyKeyLength(expectedLength.toString())
    })

    test('should edit entire JSON structure', async ({
        api: { keyService },
    }) => {
        // Arrange
        const initialValue = {
            name: faker.person.firstName(),
            age: faker.number.int({ min: 18, max: 80 }),
        }
        const newStructure = {
            fullName: faker.person.fullName(),
            email: faker.internet.email(),
            isActive: true,
            metadata: {
                createdAt: new Date().toISOString(),
                version: 1,
            },
        }

        await keyService.addJsonKeyApi(
            { keyName, value: initialValue },
            ossStandaloneConfig,
        )

        // Act
        await browserPage.openKeyDetailsByKeyName(keyName)
        await browserPage.waitForJsonDetailsToBeVisible()

        // Edit the entire JSON structure
        await browserPage.editEntireJsonStructure(JSON.stringify(newStructure))

        // Assert
        await browserPage.waitForJsonPropertyUpdate(
            'fullName',
            newStructure.fullName,
        )
        await browserPage.verifyJsonPropertyExists('email', newStructure.email)
        await browserPage.verifyJsonPropertyExists('isActive', 'true')

        // Verify metadata object and its nested properties exist
        // The metadata object should contain the nested properties
        await browserPage.verifyJsonPropertyExists(
            'createdAt',
            newStructure.metadata.createdAt,
        )
        await browserPage.verifyJsonPropertyExists('version', '1')

        // Verify old properties are no longer present
        await browserPage.verifyJsonPropertyNotExists('name')
        await browserPage.verifyJsonPropertyNotExists('age')

        await browserPage.verifyJsonStructureValid()
    })
})
