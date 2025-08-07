import { faker } from '@faker-js/faker'

import { BrowserPage } from '../../../pageObjects/browser-page'
import { test, expect } from '../../../fixtures/test'
import { ossStandaloneConfig } from '../../../helpers/conf'
import {
    addStandaloneInstanceAndNavigateToIt,
    navigateToStandaloneInstance,
} from '../../../helpers/utils'

test.describe('Browser - Edit ZSet Key', () => {
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

    test('should edit zset member score', async ({ api: { keyService } }) => {
        // Arrange
        const zsetMembers = [
            { name: faker.lorem.word(), score: 1.5 },
            { name: faker.lorem.word(), score: 2.0 },
            { name: faker.lorem.word(), score: 3.5 },
        ]
        const memberToEdit = zsetMembers[1]
        const newScore = 5.0

        await keyService.addZSetKeyApi(
            { keyName, members: zsetMembers },
            ossStandaloneConfig,
        )

        // Act
        await browserPage.openKeyDetailsByKeyName(keyName)
        await browserPage.waitForZsetMembersToLoad(zsetMembers.length)
        await browserPage.editZsetMemberScore(memberToEdit.name, newScore)

        // Assert
        await browserPage.verifyZsetMemberScore(memberToEdit.name, newScore)
        await browserPage.waitForZsetLengthToUpdate(zsetMembers.length) // Length should remain the same
    })

    test('should cancel zset member score edit', async ({
        api: { keyService },
    }) => {
        // Arrange
        const zsetMembers = [
            { name: faker.lorem.word(), score: 1.5 },
            { name: faker.lorem.word(), score: 2.0 },
        ]
        const memberToEdit = zsetMembers[0]
        const originalScore = memberToEdit.score
        const newScore = 10.0

        await keyService.addZSetKeyApi(
            { keyName, members: zsetMembers },
            ossStandaloneConfig,
        )

        // Act
        await browserPage.openKeyDetailsByKeyName(keyName)
        await browserPage.waitForZsetMembersToLoad(zsetMembers.length)
        await browserPage.cancelZsetMemberScoreEdit(memberToEdit.name, newScore)

        // Assert - score should remain unchanged
        await browserPage.verifyZsetMemberScore(
            memberToEdit.name,
            originalScore,
        )
    })

    test('should add new member to zset', async ({ api: { keyService } }) => {
        // Arrange
        const zsetMembers = [
            { name: faker.lorem.word(), score: 1.0 },
            { name: faker.lorem.word(), score: 2.0 },
        ]
        const newMember = faker.lorem.word()
        const newScore = 3.5

        await keyService.addZSetKeyApi(
            { keyName, members: zsetMembers },
            ossStandaloneConfig,
        )

        // Act
        await browserPage.openKeyDetailsByKeyName(keyName)
        await browserPage.waitForZsetMembersToLoad(zsetMembers.length)
        await browserPage.addMemberToZsetKey(newMember, newScore)

        // Assert
        const expectedLength = zsetMembers.length + 1
        await browserPage.waitForZsetLengthToUpdate(expectedLength)
        await browserPage.verifyZsetMemberExists(newMember)
        await browserPage.verifyZsetMemberScore(newMember, newScore)

        // Verify all original members are still present
        const allExpectedMembers = [
            ...zsetMembers,
            { name: newMember, score: newScore },
        ]
        await browserPage.verifyZsetContainsMembers(allExpectedMembers)
    })

    test('should handle adding duplicate member to zset (update score)', async ({
        api: { keyService },
    }) => {
        // Arrange
        const zsetMembers = [
            { name: faker.lorem.word(), score: 1.0 },
            { name: faker.lorem.word(), score: 2.0 },
        ]
        const duplicateMember = zsetMembers[0].name
        const newScore = 5.0

        await keyService.addZSetKeyApi(
            { keyName, members: zsetMembers },
            ossStandaloneConfig,
        )

        // Act
        await browserPage.openKeyDetailsByKeyName(keyName)
        await browserPage.waitForZsetMembersToLoad(zsetMembers.length)
        await browserPage.addMemberToZsetKey(duplicateMember, newScore)

        // Assert - length should remain the same (member was updated, not added)
        await browserPage.waitForZsetScoreToUpdate(newScore)
        await browserPage.waitForZsetLengthToUpdate(zsetMembers.length)
        await browserPage.verifyZsetMemberScore(duplicateMember, newScore)
    })

    test('should remove single member from zset', async ({
        api: { keyService },
    }) => {
        // Arrange
        const zsetMembers = [
            { name: faker.lorem.word(), score: 1.0 },
            { name: faker.lorem.word(), score: 2.0 },
            { name: faker.lorem.word(), score: 3.0 },
        ]
        const memberToRemove = zsetMembers[1].name

        await keyService.addZSetKeyApi(
            { keyName, members: zsetMembers },
            ossStandaloneConfig,
        )

        // Act
        await browserPage.openKeyDetailsByKeyName(keyName)
        await browserPage.waitForZsetMembersToLoad(zsetMembers.length)
        await browserPage.removeMemberFromZset(memberToRemove)

        // Assert
        const expectedLength = zsetMembers.length - 1
        await browserPage.waitForZsetLengthToUpdate(expectedLength)
        await browserPage.verifyZsetMemberNotExists(memberToRemove)
        await browserPage.verifyZsetDoesNotContainMembers([memberToRemove])

        // Verify remaining members are still present
        const remainingMembers = zsetMembers.filter(
            (member) => member.name !== memberToRemove,
        )
        await browserPage.verifyZsetContainsMembers(remainingMembers)
    })

    test('should remove multiple members from zset', async ({
        api: { keyService },
    }) => {
        // Arrange
        const zsetMembers = [
            { name: faker.lorem.word(), score: 1.0 },
            { name: faker.lorem.word(), score: 2.0 },
            { name: faker.lorem.word(), score: 3.0 },
            { name: faker.lorem.word(), score: 4.0 },
        ]
        const membersToRemove = [zsetMembers[0].name, zsetMembers[2].name]

        await keyService.addZSetKeyApi(
            { keyName, members: zsetMembers },
            ossStandaloneConfig,
        )

        // Act
        await browserPage.openKeyDetailsByKeyName(keyName)
        await browserPage.waitForZsetMembersToLoad(zsetMembers.length)

        // Remove members one by one
        await browserPage.removeMultipleMembersFromZset(membersToRemove)

        // Assert
        const expectedLength = zsetMembers.length - membersToRemove.length
        await browserPage.waitForZsetLengthToUpdate(expectedLength)

        // Verify removed members are gone
        await browserPage.verifyZsetDoesNotContainMembers(membersToRemove)

        // Verify remaining members are still present
        const remainingMembers = zsetMembers.filter(
            (member) => !membersToRemove.includes(member.name),
        )
        await browserPage.verifyZsetContainsMembers(remainingMembers)
    })

    test('should remove all members from zset (delete key when empty)', async ({
        api: { keyService },
    }) => {
        // Arrange
        const zsetMembers = [
            { name: faker.lorem.word(), score: 1.0 },
            { name: faker.lorem.word(), score: 2.0 },
        ]

        await keyService.addZSetKeyApi(
            { keyName, members: zsetMembers },
            ossStandaloneConfig,
        )

        // Act
        await browserPage.openKeyDetailsByKeyName(keyName)
        await browserPage.waitForZsetMembersToLoad(zsetMembers.length)

        // Remove all members
        await browserPage.removeAllZsetMembers(zsetMembers)

        // Assert - key should be deleted when all members are removed
        const isDetailsClosed = await browserPage.isKeyDetailsClosed()
        expect(isDetailsClosed).toBe(true)
        await browserPage.verifyKeyDoesNotExist(keyName)
    })

    test('should search within zset members', async ({
        api: { keyService },
    }) => {
        // Arrange
        const zsetMembers = [
            { name: 'apple', score: 1.0 },
            { name: 'banana', score: 2.0 },
            { name: 'carrot', score: 3.0 },
            { name: 'date', score: 4.0 },
        ]
        const searchTerm = 'apple' // Exact match search

        await keyService.addZSetKeyApi(
            { keyName, members: zsetMembers },
            ossStandaloneConfig,
        )

        // Act
        await browserPage.openKeyDetailsByKeyName(keyName)
        await browserPage.waitForZsetMembersToLoad(zsetMembers.length)

        // First verify all members are visible before search
        await browserPage.verifyZsetContainsMembers(zsetMembers)

        // Search for exact member name
        await browserPage.searchInZsetMembers(searchTerm)

        // For exact match search, only the searched member should be visible
        const expectedVisibleMembers = zsetMembers.filter(
            (member) => member.name === searchTerm,
        )
        await browserPage.verifyZsetContainsMembers(expectedVisibleMembers)

        // Clear search and verify all members are visible again
        await browserPage.clearZsetSearch()
        await browserPage.waitForZsetMembersToLoad(zsetMembers.length)
        await browserPage.verifyZsetContainsMembers(zsetMembers)
    })

    test('should handle mixed operations on zset', async ({
        api: { keyService },
    }) => {
        // Arrange
        const zsetMembers = [
            { name: faker.lorem.word(), score: 1.0 },
            { name: faker.lorem.word(), score: 2.0 },
            { name: faker.lorem.word(), score: 3.0 },
        ]
        const newMember = faker.lorem.word()
        const newScore = 4.5
        const memberToRemove = zsetMembers[1].name
        const memberToEdit = zsetMembers[0].name
        const editedScore = 10.0

        await keyService.addZSetKeyApi(
            { keyName, members: zsetMembers },
            ossStandaloneConfig,
        )

        // Act
        await browserPage.openKeyDetailsByKeyName(keyName)
        await browserPage.waitForZsetMembersToLoad(zsetMembers.length)

        // Add a new member
        await browserPage.addMemberToZsetKey(newMember, newScore)
        await browserPage.waitForZsetLengthToUpdate(zsetMembers.length + 1)

        // Edit existing member's score
        await browserPage.editZsetMemberScore(memberToEdit, editedScore)

        // Remove a member
        await browserPage.removeMemberFromZset(memberToRemove)
        await browserPage.waitForZsetLengthToUpdate(zsetMembers.length) // back to original count

        // Assert final state
        await browserPage.verifyZsetMemberExists(newMember)
        await browserPage.verifyZsetMemberScore(newMember, newScore)
        await browserPage.verifyZsetMemberScore(memberToEdit, editedScore)
        await browserPage.verifyZsetMemberNotExists(memberToRemove)

        // Verify final member composition
        const expectedFinalMembers = [
            { name: memberToEdit, score: editedScore },
            { name: zsetMembers[2].name, score: zsetMembers[2].score },
            { name: newMember, score: newScore },
        ]
        await browserPage.verifyZsetContainsMembers(expectedFinalMembers)
    })
})
