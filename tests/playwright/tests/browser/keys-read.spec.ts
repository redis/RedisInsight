import { faker } from '@faker-js/faker'

import { BrowserPage } from '../../pageObjects/browser-page'
import { test } from '../../fixtures/test'
import { ossStandaloneConfig } from '../../helpers/conf'
import {
    addStandaloneInstanceAndNavigateToIt,
    navigateToStandaloneInstance,
} from '../../helpers/utils'

test.describe('Browser - Read Key Details', () => {
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

    test('should open key details when clicking on string key', async ({
        api: { keyService },
    }) => {
        // Arrange test data
        const keyValue = faker.lorem.words(3)
        const keyTTL = 3600 // 1 hour

        // Create a string key with TTL using API
        await keyService.addStringKeyApi(
            { keyName, value: keyValue, expire: keyTTL },
            ossStandaloneConfig,
        )

        // Open key details and verify all aspects
        await browserPage.openKeyDetailsAndVerify(keyName)
        await browserPage.verifyStringKeyContent(keyValue)
        await browserPage.verifyKeyLength(`${keyValue.length}`)
        await browserPage.verifyKeySize()
        await browserPage.verifyKeyTTL(keyTTL)
        await browserPage.closeKeyDetailsAndVerify()
    })

    test('should open key details when clicking on hash key', async ({
        api: { keyService },
    }) => {
        const fieldName = faker.string.alphanumeric(8)
        const fieldValue = faker.lorem.words(2)
        const keyTTL = 7200 // 2 hours

        // Create a hash key with TTL using API
        await keyService.addHashKeyApi(
            {
                keyName,
                fields: [{ field: fieldName, value: fieldValue }],
                expire: keyTTL,
            },
            ossStandaloneConfig,
        )

        // Open key details and verify all aspects
        await browserPage.openKeyDetailsAndVerify(keyName)
        await browserPage.verifyHashKeyContent(fieldName, fieldValue)
        await browserPage.verifyKeyLength('1') // We created 1 field
        await browserPage.verifyKeySize()
        await browserPage.verifyKeyTTL(keyTTL)
        await browserPage.closeKeyDetailsAndVerify()
    })

    test('should open key details when clicking on list key', async ({
        api: { keyService },
    }) => {
        const listElements = [
            faker.lorem.word(),
            faker.lorem.word(),
            faker.lorem.word(),
        ]
        const keyTTL = 3600 // 1 hour

        // Create a list key with multiple elements using API
        await keyService.addListKeyApi(
            { keyName, elements: listElements, expire: keyTTL },
            ossStandaloneConfig,
        )

        // Open key details and verify all aspects
        await browserPage.openKeyDetailsAndVerify(keyName)
        await browserPage.verifyListKeyContent(listElements)
        await browserPage.verifyKeyLength(listElements.length.toString())
        await browserPage.verifyKeySize()
        await browserPage.verifyKeyTTL(keyTTL)
        await browserPage.closeKeyDetailsAndVerify()
    })

    test('should open key details when clicking on set key', async ({
        api: { keyService },
    }) => {
        const setMembers = [
            faker.lorem.word(),
            faker.lorem.word(),
            faker.lorem.word(),
        ]
        const keyTTL = 3600 // 1 hour

        // Create a set key with multiple members and TTL using API
        await keyService.addSetKeyApi(
            { keyName, members: setMembers, expire: keyTTL },
            ossStandaloneConfig,
        )

        // Open key details and verify all aspects
        await browserPage.openKeyDetailsAndVerify(keyName)
        await browserPage.verifySetKeyContent(setMembers)
        await browserPage.verifyKeyLength(setMembers.length.toString())
        await browserPage.verifyKeySize()
        await browserPage.verifyKeyTTL(keyTTL)
        await browserPage.closeKeyDetailsAndVerify()
    })

    test('should open key details when clicking on zset key', async ({
        api: { keyService },
    }) => {
        const zsetMembers = [
            { name: faker.lorem.word(), score: 1.5 },
            { name: faker.lorem.word(), score: 2.0 },
            { name: faker.lorem.word(), score: 10 },
        ]
        const keyTTL = 3600 // 1 hour

        // Create a zset key with multiple members and TTL using API
        await keyService.addZSetKeyApi(
            { keyName, members: zsetMembers, expire: keyTTL },
            ossStandaloneConfig,
        )

        // Open key details and verify all aspects
        await browserPage.openKeyDetailsAndVerify(keyName)
        await browserPage.verifyZsetKeyContent(zsetMembers)
        await browserPage.verifyKeyLength(zsetMembers.length.toString())
        await browserPage.verifyKeySize()
        await browserPage.verifyKeyTTL(keyTTL)
        await browserPage.closeKeyDetailsAndVerify()
    })

    test('should open key details when clicking on json key', async ({
        api: { keyService },
    }) => {
        const jsonValue = {
            name: faker.person.fullName(),
            age: faker.number.int({ min: 18, max: 80 }),
            active: true,
            hobbies: [faker.lorem.word(), faker.lorem.word()],
            address: {
                street: faker.location.streetAddress(),
                city: faker.location.city(),
            },
        }
        const keyTTL = 1800 // 30 minutes

        // Create a JSON key with TTL using API
        await keyService.addJsonKeyApi(
            { keyName, value: jsonValue, expire: keyTTL },
            ossStandaloneConfig,
        )

        // Open key details and verify all aspects
        await browserPage.openKeyDetailsAndVerify(keyName)
        await browserPage.verifyJsonKeyContent(jsonValue)
        await browserPage.verifyKeyLength(
            Object.keys(jsonValue).length.toString(),
        )
        await browserPage.verifyKeySize()
        await browserPage.verifyKeyTTL(keyTTL)
        await browserPage.closeKeyDetailsAndVerify()
    })

    test('should open key details when clicking on stream key', async ({
        api: { keyService },
    }) => {
        const streamEntries = [
            {
                id: '*',
                fields: [
                    { name: 'temperature', value: '25.5' },
                    { name: 'humidity', value: '60' },
                    { name: 'location', value: 'sensor-001' },
                ],
            },
            {
                id: '*',
                fields: [
                    { name: 'temperature', value: '26.2' },
                    { name: 'humidity', value: '58' },
                    { name: 'location', value: 'sensor-002' },
                ],
            },
        ]
        const keyTTL = 7200 // 2 hours

        // Create a stream key with multiple entries and TTL using API
        await keyService.addStreamKeyApi(
            { keyName, entries: streamEntries, expire: keyTTL },
            ossStandaloneConfig,
        )

        // Open key details and verify all aspects
        await browserPage.openKeyDetailsAndVerify(keyName)
        await browserPage.verifyStreamKeyContent(streamEntries)
        await browserPage.verifyKeyLength(streamEntries.length.toString())
        await browserPage.verifyKeySize()
        await browserPage.verifyKeyTTL(keyTTL)
        await browserPage.closeKeyDetailsAndVerify()
    })
})
