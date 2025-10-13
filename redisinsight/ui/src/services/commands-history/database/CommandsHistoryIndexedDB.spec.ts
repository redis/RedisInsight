import { faker } from '@faker-js/faker'
import { CommandExecutionType } from 'uiSrc/slices/interfaces'
import { CommandsHistoryIndexedDB } from './CommandsHistoryIndexedDB'

describe('CommandsHistoryIndexedDB', () => {
  let commandsHistoryIndexedDB: CommandsHistoryIndexedDB

  beforeEach(() => {
    commandsHistoryIndexedDB = new CommandsHistoryIndexedDB()
  })

  describe('getCommandsHistory', () => {
    it('should return successful result', async () => {
      const instanceId = 'test-instance-id'
      const commandExecutionType = faker.helpers.enumValue(CommandExecutionType)

      const result = await commandsHistoryIndexedDB.getCommandsHistory(
        instanceId,
        commandExecutionType,
      )

      expect(result).toEqual({
        success: true,
        data: [],
      })
    })

    it.each([
      ['Workbench', CommandExecutionType.Workbench],
      ['Search', CommandExecutionType.Search],
    ])(
      'should handle %s command execution type',
      async (_, commandExecutionType) => {
        const instanceId = 'test-instance-id'

        const result = await commandsHistoryIndexedDB.getCommandsHistory(
          instanceId,
          commandExecutionType,
        )

        expect(result).toEqual({
          success: true,
          data: [],
        })
      },
    )

    it('should handle different instance IDs', async () => {
      const instanceId1 = 'instance-1'
      const instanceId2 = 'instance-2'
      const commandExecutionType = faker.helpers.enumValue(CommandExecutionType)

      const result1 = await commandsHistoryIndexedDB.getCommandsHistory(
        instanceId1,
        commandExecutionType,
      )
      const result2 = await commandsHistoryIndexedDB.getCommandsHistory(
        instanceId2,
        commandExecutionType,
      )

      expect(result1).toEqual({
        success: true,
        data: [],
      })
      expect(result2).toEqual({
        success: true,
        data: [],
      })
    })
  })
})
