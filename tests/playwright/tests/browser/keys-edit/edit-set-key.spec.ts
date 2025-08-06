import { faker } from '@faker-js/faker'

import { BrowserPage } from '../../../pageObjects/browser-page'
import { test, expect } from '../../../fixtures/test'
import { ossStandaloneConfig } from '../../../helpers/conf'
import {
    addStandaloneInstanceAndNavigateToIt,
    navigateToStandaloneInstance,
} from '../../../helpers/utils'

test.describe('Browser - Edit Key Operations - Set Key Editing', () => {
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

    test('should add new member to set key successfully', async ({
        api: { keyService },
    }) => {
        // Arrange: Create a set key with initial members
        const initialMembers = [
            faker.lorem.word(),
            faker.lorem.word(),
            faker.lorem.word(),
        ]
        const newMember = faker.lorem.word()

        await keyService.addSetKeyApi(
            { keyName, members: initialMembers },
            ossStandaloneConfig,
        )

        // Open key details and verify initial state
        await browserPage.openKeyDetailsAndVerify(keyName)
        await browserPage.waitForSetMembersToLoad(initialMembers.length)
        await browserPage.verifySetContainsMembers(initialMembers)
        await browserPage.verifyKeyLength(initialMembers.length.toString())

        // Add a new member
        await browserPage.addMemberToSetKey(newMember)

        // Verify new member appears and length updates
        await browserPage.waitForSetLengthToUpdate(initialMembers.length + 1)
        await browserPage.verifySetContainsMembers([
            ...initialMembers,
            newMember,
        ])
    })

    test('should handle adding duplicate member to set (no length change)', async ({
        api: { keyService },
    }) => {
        // Arrange: Create a set key with initial members
        const initialMembers = [
            faker.lorem.word(),
            faker.lorem.word(),
            faker.lorem.word(),
        ]
        const duplicateMember = initialMembers[0] // Use existing member

        await keyService.addSetKeyApi(
            { keyName, members: initialMembers },
            ossStandaloneConfig,
        )

        // Open key details and verify initial state
        await browserPage.openKeyDetailsAndVerify(keyName)
        await browserPage.waitForSetMembersToLoad(initialMembers.length)
        await browserPage.verifySetContainsMembers(initialMembers)
        await browserPage.verifyKeyLength(initialMembers.length.toString())

        // Try to add duplicate member
        await browserPage.addMemberToSetKey(duplicateMember)

        // Wait for the operation to complete and verify length remains the same
        await browserPage.waitForSetMembersToLoad(initialMembers.length)
        await browserPage.verifyKeyLength(initialMembers.length.toString())
        await browserPage.verifySetContainsMembers(initialMembers)
    })

    test('should remove member from set key successfully', async ({
        api: { keyService },
    }) => {
        // Arrange: Create a set key with multiple members
        const setMembers = [
            faker.lorem.word(),
            faker.lorem.word(),
            faker.lorem.word(),
            faker.lorem.word(),
        ]
        const memberToRemove = setMembers[1]

        await keyService.addSetKeyApi(
            { keyName, members: setMembers },
            ossStandaloneConfig,
        )

        // Open key details and verify initial state (remove member test)
        await browserPage.openKeyDetailsAndVerify(keyName)
        await browserPage.waitForSetMembersToLoad(setMembers.length)
        await browserPage.verifySetContainsMembers(setMembers)
        await browserPage.verifyKeyLength(setMembers.length.toString())

        // Remove a member
        await browserPage.removeMemberFromSet(memberToRemove)

        // Verify member was removed and length updated
        await browserPage.waitForSetLengthToUpdate(setMembers.length - 1)
        await browserPage.verifySetDoesNotContainMembers([memberToRemove])

        // Verify other members still exist
        const remainingMembers = setMembers.filter(
            (member) => member !== memberToRemove,
        )
        await browserPage.verifySetContainsMembers(remainingMembers)
    })

    test('should search for specific member in set', async ({
        api: { keyService },
    }) => {
        // Arrange: Create a set key with various members
        const setMembers = ['apple', 'banana', 'orange', 'grape', 'strawberry']
        const searchTerm = 'apple'

        await keyService.addSetKeyApi(
            { keyName, members: setMembers },
            ossStandaloneConfig,
        )

        // Open key details and verify initial state
        await browserPage.openKeyDetailsAndVerify(keyName)
        await browserPage.waitForSetMembersToLoad(setMembers.length)
        await browserPage.verifySetContainsMembers(setMembers)

        // Perform search
        await browserPage.searchByTheValueInSetKey(searchTerm)

        // Verify search input has the search term
        const searchInput = browserPage.page.getByTestId('search')
        await expect(searchInput).toHaveValue(searchTerm)

        // Verify search results: searched item visible, others hidden
        await browserPage.verifySetSearchResults(searchTerm, setMembers)

        // Clear search and verify all members are visible again
        await browserPage.clearSetSearch()
        await expect(searchInput).toHaveValue('')
        await browserPage.verifySetContainsMembers(setMembers)
    })

    test('should perform mixed operations on set key', async ({
        api: { keyService },
    }) => {
        // Arrange: Create a set key with initial members
        const initialMembers = [
            faker.lorem.word(),
            faker.lorem.word(),
            faker.lorem.word(),
        ]
        const newMember = faker.lorem.word()
        const memberToRemove = initialMembers[1]

        await keyService.addSetKeyApi(
            { keyName, members: initialMembers },
            ossStandaloneConfig,
        )

        // Open key details and verify initial state
        await browserPage.openKeyDetailsAndVerify(keyName)
        await browserPage.waitForSetMembersToLoad(initialMembers.length)
        await browserPage.verifySetContainsMembers(initialMembers)
        await browserPage.verifyKeyLength(initialMembers.length.toString())

        // Add a new member
        await browserPage.addMemberToSetKey(newMember)
        await browserPage.waitForSetLengthToUpdate(initialMembers.length + 1)

        // Remove an existing member
        await browserPage.removeMemberFromSet(memberToRemove)
        await browserPage.waitForSetLengthToUpdate(
            initialMembers.length, // Back to original length
        )

        // Verify final state: original members (minus removed) + new member
        const finalExpectedMembers = initialMembers
            .filter((member) => member !== memberToRemove)
            .concat(newMember)
        await browserPage.verifySetContainsMembers(finalExpectedMembers)
        await browserPage.verifySetDoesNotContainMembers([memberToRemove])
    })

    test('should handle removing all members from set (key should be deleted)', async ({
        api: { keyService },
    }) => {
        // Arrange: Create a set key with a few members
        const setMembers = [faker.lorem.word(), faker.lorem.word()]

        await keyService.addSetKeyApi(
            { keyName, members: setMembers },
            ossStandaloneConfig,
        )

        // Open key details and verify initial state
        await browserPage.openKeyDetailsAndVerify(keyName)
        await browserPage.waitForSetMembersToLoad(setMembers.length)
        await browserPage.verifySetContainsMembers(setMembers)

        // Remove all members
        await setMembers.reduce(async (promise, member) => {
            await promise
            await browserPage.removeMemberFromSet(member)
        }, Promise.resolve())

        // Verify set is empty (key should be removed when set becomes empty)
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
