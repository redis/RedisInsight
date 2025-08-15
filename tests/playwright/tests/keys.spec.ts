/* eslint-disable no-empty-pattern */
import { faker } from '@faker-js/faker'

import { BrowserPage } from '../pageObjects/browser-page'
import { test, expect } from '../fixtures/test'
import { ossStandaloneConfig } from '../helpers/conf'
import {
    addStandaloneInstanceAndNavigateToIt,
    navigateToStandaloneInstance,
} from '../helpers/utils'

test.describe('Adding Database Keys', () => {
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
        // Clean up: delete the key
        await keyService.deleteKeyByNameApi(
            keyName,
            ossStandaloneConfig.databaseName,
        )

        await cleanupInstance()
    })

    test('Verify that user can add Hash Key', async ({}) => {
        await browserPage.addHashKey(keyName)

        // Check that new key is displayed in the list
        await browserPage.searchByKeyName(keyName)
        const isKeyIsDisplayedInTheList =
            await browserPage.isKeyIsDisplayedInTheList(keyName)
        await expect(isKeyIsDisplayedInTheList).toBe(true)
    })

    test('Verify that user can add Set Key', async ({}) => {
        await browserPage.addSetKey(keyName)

        // Check that new key is displayed in the list
        await browserPage.searchByKeyName(keyName)
        const isKeyIsDisplayedInTheList =
            await browserPage.isKeyIsDisplayedInTheList(keyName)
        await expect(isKeyIsDisplayedInTheList).toBe(true)
    })

    test('Verify that user can add List Key', async ({}) => {
        await browserPage.addListKey(keyName)

        // Check that new key is displayed in the list
        await browserPage.searchByKeyName(keyName)
        const isKeyIsDisplayedInTheList =
            await browserPage.isKeyIsDisplayedInTheList(keyName)
        await expect(isKeyIsDisplayedInTheList).toBe(true)
    })

    test('Verify that user can add String Key', async ({}) => {
        await browserPage.addStringKey(keyName)

        // Check that new key is displayed in the list
        await browserPage.searchByKeyName(keyName)
        const isKeyIsDisplayedInTheList =
            await browserPage.isKeyIsDisplayedInTheList(keyName)
        await expect(isKeyIsDisplayedInTheList).toBe(true)
    })

    test('Verify that user can add ZSet Key', async ({}) => {
        const scores = '111'
        await browserPage.addZSetKey(keyName, scores)

        // Check that new key is displayed in the list
        await browserPage.searchByKeyName(keyName)
        const isKeyIsDisplayedInTheList =
            await browserPage.isKeyIsDisplayedInTheList(keyName)
        await expect(isKeyIsDisplayedInTheList).toBe(true)
    })

    test('Verify that user can add Stream key', async ({}) => {
        const keyField = faker.string.alphanumeric(20)
        const keyValue = faker.string.alphanumeric(20)

        await browserPage.addStreamKey(keyName, keyField, keyValue)

        // Check that new key is displayed in the list
        await browserPage.searchByKeyName(keyName)
        const isKeyIsDisplayedInTheList =
            await browserPage.isKeyIsDisplayedInTheList(keyName)
        await expect(isKeyIsDisplayedInTheList).toBe(true)
    })
})
