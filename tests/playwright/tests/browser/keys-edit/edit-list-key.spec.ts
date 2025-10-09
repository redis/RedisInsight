import { faker } from '@faker-js/faker'

import { BrowserPage } from '../../../pageObjects/browser-page'
import { test, expect } from '../../../fixtures/test'
import { ossStandaloneConfig } from '../../../helpers/conf'
import { AddElementInList } from '../../../helpers/constants'
import {
    addStandaloneInstanceAndNavigateToIt,
    navigateToStandaloneInstance,
} from '../../../helpers/utils'

test.describe('Browser - Edit Key Operations - List Key Editing', () => {
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

    test('should edit list element value successfully', async ({
        api: { keyService },
    }) => {
        // Arrange: Create a list key with multiple elements
        const listElements = [
            faker.lorem.word(),
            faker.lorem.word(),
            faker.lorem.word(),
        ]
        const newElementValue = faker.lorem.word()

        await keyService.addListKeyApi(
            { keyName, elements: listElements },
            ossStandaloneConfig,
        )

        // Open key details and verify initial content
        await browserPage.openKeyDetailsAndVerify(keyName)
        await browserPage.verifyListContainsElements(listElements)
        await browserPage.verifyKeyLength(listElements.length.toString())

        // Edit the first element value
        await browserPage.editListElementValue(newElementValue)

        // Verify the element was updated
        await browserPage.verifyListContainsElements([newElementValue])
        await browserPage.verifyListDoesNotContainElements([listElements[0]])
        await browserPage.verifyKeyLength(listElements.length.toString()) // Length should remain the same
    })

    test('should cancel list element edit successfully', async ({
        api: { keyService },
    }) => {
        // Arrange: Create a list key
        const listElements = [faker.lorem.word(), faker.lorem.word()]
        const attemptedValue = faker.lorem.word()

        await keyService.addListKeyApi(
            { keyName, elements: listElements },
            ossStandaloneConfig,
        )

        // Open key details and start edit but cancel
        await browserPage.openKeyDetailsAndVerify(keyName)
        await browserPage.verifyListContainsElements(listElements)

        // Start edit but cancel
        await browserPage.cancelListElementEdit(attemptedValue)

        // Verify original content is preserved
        await browserPage.verifyListContainsElements(listElements)
        await browserPage.verifyListDoesNotContainElements([attemptedValue])
    })

    test('should add elements to list tail successfully', async ({
        api: { keyService },
    }) => {
        // Arrange: Create a list key with initial elements
        const initialElements = [faker.lorem.word(), faker.lorem.word()]
        const newElements = [faker.lorem.word(), faker.lorem.word()]

        await keyService.addListKeyApi(
            { keyName, elements: initialElements },
            ossStandaloneConfig,
        )

        // Open key details and add elements to tail
        await browserPage.openKeyDetailsAndVerify(keyName)
        await browserPage.verifyListContainsElements(initialElements)

        await browserPage.addElementsToList(newElements, AddElementInList.Tail)

        // Verify all elements are present and length is updated
        const expectedLength = initialElements.length + newElements.length
        await browserPage.waitForListLengthToUpdate(expectedLength)
        await browserPage.verifyListContainsElements([
            ...initialElements,
            ...newElements,
        ])
    })

    test('should add elements to list head successfully', async ({
        api: { keyService },
    }) => {
        // Arrange: Create a list key with initial elements
        const initialElements = [faker.lorem.word(), faker.lorem.word()]
        const newElements = [faker.lorem.word()]

        await keyService.addListKeyApi(
            { keyName, elements: initialElements },
            ossStandaloneConfig,
        )

        // Open key details and add elements to head
        await browserPage.openKeyDetailsAndVerify(keyName)
        await browserPage.verifyListContainsElements(initialElements)

        await browserPage.addElementsToList(newElements, AddElementInList.Head)

        // Verify all elements are present and length is updated
        const expectedLength = initialElements.length + newElements.length
        await browserPage.waitForListLengthToUpdate(expectedLength)
        await browserPage.verifyListContainsElements([
            ...newElements,
            ...initialElements,
        ])
    })

    test('should remove elements from list tail successfully', async ({
        api: { keyService },
    }) => {
        // Arrange: Create a list key with multiple elements
        const listElements = [
            faker.lorem.word(),
            faker.lorem.word(),
            faker.lorem.word(),
            faker.lorem.word(),
        ]
        const removeCount = 2

        await keyService.addListKeyApi(
            { keyName, elements: listElements },
            ossStandaloneConfig,
        )

        // Open key details and remove elements from tail
        await browserPage.openKeyDetailsAndVerify(keyName)
        await browserPage.verifyListContainsElements(listElements)

        await browserPage.removeListElementsFromTail(removeCount)

        // Verify length is updated (Redis lists remove from the right/tail)
        const expectedLength = listElements.length - removeCount
        await browserPage.waitForListLengthToUpdate(expectedLength)
        await browserPage.verifyKeyLength(expectedLength.toString())

        // Verify the correct elements were removed (last 2 elements should be gone)
        const remainingElements = listElements.slice(0, -removeCount) // Keep all but last 2
        const removedElements = listElements.slice(-removeCount) // Last 2 elements
        await browserPage.verifyListContainsElements(remainingElements)
        await browserPage.verifyListDoesNotContainElements(removedElements)
    })

    test('should remove elements from list head successfully', async ({
        api: { keyService },
    }) => {
        // Arrange: Create a list key with multiple elements
        const listElements = [
            faker.lorem.word(),
            faker.lorem.word(),
            faker.lorem.word(),
            faker.lorem.word(),
        ]
        const removeCount = 1

        await keyService.addListKeyApi(
            { keyName, elements: listElements },
            ossStandaloneConfig,
        )

        // Open key details and remove elements from head
        await browserPage.openKeyDetailsAndVerify(keyName)
        await browserPage.verifyListContainsElements(listElements)

        await browserPage.removeListElementsFromHead(removeCount)

        // Verify length is updated (Redis lists remove from the left/head)
        const expectedLength = listElements.length - removeCount
        await browserPage.waitForListLengthToUpdate(expectedLength)
        await browserPage.verifyKeyLength(expectedLength.toString())

        // Verify the correct elements were removed (first element should be gone)
        const remainingElements = listElements.slice(removeCount) // Skip first element
        const removedElements = listElements.slice(0, removeCount) // First element
        await browserPage.verifyListContainsElements(remainingElements)
        await browserPage.verifyListDoesNotContainElements(removedElements)
    })

    test('should handle removing all elements from list', async ({
        api: { keyService },
    }) => {
        // Arrange: Create a list key with a few elements
        const listElements = [faker.lorem.word(), faker.lorem.word()]

        await keyService.addListKeyApi(
            { keyName, elements: listElements },
            ossStandaloneConfig,
        )

        // Open key details and remove all elements
        await browserPage.openKeyDetailsAndVerify(keyName)
        await browserPage.verifyListContainsElements(listElements)

        await browserPage.removeListElementsFromTail(listElements.length)

        // Verify list is empty (key should be removed when list becomes empty)
        await expect
            .poll(async () => {
                try {
                    return await browserPage.isKeyDetailsOpen(keyName)
                } catch {
                    return false
                }
            })
            .toBe(false)
    })
})
