import { rest } from 'msw'
import { faker } from '@faker-js/faker'
import {
  CommandExecution,
  CommandExecutionType,
  CommandExecutionUI,
  ResultsMode,
  RunQueryMode,
} from 'uiSrc/slices/interfaces'
import {
  commandExecutionFactory,
  commandExecutionUIFactory,
} from 'uiSrc/mocks/factories/workbench/commandExectution.factory'
import {
  addCommands,
  clearCommands,
  getLocalWbHistory,
  removeCommand,
} from 'uiSrc/services/workbenchStorage'
import { getUrl } from 'uiSrc/utils'
import { ApiEndpoints } from 'uiSrc/constants'
import { mswServer } from 'uiSrc/mocks/server'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { CommandsHistoryIndexedDB } from './CommandsHistoryIndexedDB'

// Mock dependencies
jest.mock('uiSrc/services/workbenchStorage', () => ({
  addCommands: jest.fn(),
  clearCommands: jest.fn(),
  getLocalWbHistory: jest.fn(),
  removeCommand: jest.fn(),
  wbHistoryStorage: {},
}))

jest.mock('uiSrc/services/vectorSearchHistoryStorage', () => ({
  vectorSearchCommandsHistoryStorage: {},
}))

const mockedAddCommands = jest.mocked(addCommands)
const mockedClearCommands = jest.mocked(clearCommands)
const mockedGetLocalWbHistory = jest.mocked(getLocalWbHistory)
const mockedRemoveCommand = jest.mocked(removeCommand)

describe('CommandsHistoryIndexedDB', () => {
  let commandsHistoryIndexedDB: CommandsHistoryIndexedDB
  const mockInstanceId = INSTANCE_ID_MOCK
  const mockCommandId = faker.string.uuid()
  const mockCommandExecutionType = faker.helpers.enumValue(CommandExecutionType)
  const mockCommandHistoryData = commandExecutionFactory.buildList(3)

  beforeEach(() => {
    jest.clearAllMocks()
    commandsHistoryIndexedDB = new CommandsHistoryIndexedDB(
      mockCommandExecutionType,
    )
  })

  describe('getCommandsHistory', () => {
    it('should return successful result with data from storage', async () => {
      mockedGetLocalWbHistory.mockResolvedValue(mockCommandHistoryData)
      const expectedResultCommands = mockCommandHistoryData.map((cmd) => ({
        ...cmd,
        emptyCommand: false,
      })) as CommandExecutionUI[]

      const result = await commandsHistoryIndexedDB.getCommandsHistory(
        mockInstanceId,
        mockCommandExecutionType,
      )

      expect(result).toEqual({
        success: true,
        data: expectedResultCommands,
      })
    })

    it('should return empty array when no data in storage', async () => {
      mockedGetLocalWbHistory.mockResolvedValue([])

      const result = await commandsHistoryIndexedDB.getCommandsHistory(
        mockInstanceId,
        mockCommandExecutionType,
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
        const service = new CommandsHistoryIndexedDB(commandExecutionType)
        mockedGetLocalWbHistory.mockResolvedValue([])

        const result = await service.getCommandsHistory(
          mockInstanceId,
          commandExecutionType,
        )

        expect(result).toEqual({
          success: true,
          data: [],
        })
      },
    )

    it('should handle different instance IDs', async () => {
      const instanceId1 = faker.string.uuid()
      const instanceId2 = faker.string.uuid()
      mockedGetLocalWbHistory.mockResolvedValue([])

      const result1 = await commandsHistoryIndexedDB.getCommandsHistory(
        instanceId1,
        mockCommandExecutionType,
      )
      const result2 = await commandsHistoryIndexedDB.getCommandsHistory(
        instanceId2,
        mockCommandExecutionType,
      )

      expect(mockedGetLocalWbHistory).toHaveBeenCalledWith(
        expect.any(Object),
        instanceId1,
      )
      expect(mockedGetLocalWbHistory).toHaveBeenCalledWith(
        expect.any(Object),
        instanceId2,
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

  describe('addCommandsToHistory', () => {
    const mockCommands = [faker.lorem.word(), faker.lorem.word()]
    const mockOptions = {
      activeRunQueryMode: faker.lorem.word(),
      resultsMode: faker.lorem.word(),
    }
    const mockCommandExecutions = commandExecutionUIFactory.buildList(2)

    it('should successfully add commands to history', async () => {
      const expectedResultCommands = mockCommandExecutions.map((cmd) => ({
        ...cmd,
        emptyCommand: false,
        createdAt: cmd.createdAt?.toISOString(),
      })) as unknown as CommandExecutionUI[]

      // Override the MSW handler to return our mock commands
      mswServer.use(
        rest.post<CommandExecution[]>(
          getMswURL(
            getUrl(mockInstanceId, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
          ),
          async (_req, res, ctx) =>
            res(ctx.status(200), ctx.json(mockCommandExecutions)),
        ),
      )

      mockedAddCommands.mockResolvedValue(undefined)

      const result = await commandsHistoryIndexedDB.addCommandsToHistory(
        mockInstanceId,
        mockCommandExecutionType,
        mockCommands,
        mockOptions,
      )

      expect(result).toEqual({
        success: true,
        data: expectedResultCommands,
      })
    })

    it('should handle unsuccessful status code 400', async () => {
      const statusCode = 400
      const commandExecutionType = CommandExecutionType.Workbench
      const mockCommandsStrings = commandExecutionFactory
        .buildList(2)
        .map((cmd) => cmd.command)

      // Override the MSW handler to return an error status
      mswServer.use(
        rest.post<CommandExecution[]>(
          getMswURL(
            getUrl(mockInstanceId, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
          ),
          async (_req, res, ctx) => res(ctx.status(statusCode)),
        ),
      )

      const result = await commandsHistoryIndexedDB.addCommandsToHistory(
        mockInstanceId,
        commandExecutionType,
        mockCommandsStrings,
        {
          activeRunQueryMode: RunQueryMode.ASCII,
          resultsMode: ResultsMode.Default,
        },
      )

      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(Error)
      expect(result.error?.message).toBe(
        `Request failed with status code ${statusCode}`,
      )
    })

    it('should handle network errors', async () => {
      const mockError = 'Network Error'
      const commandExecutionType = CommandExecutionType.Workbench
      const mockCommandsStrings = commandExecutionFactory
        .buildList(2)
        .map((cmd) => cmd.command)

      // Override the MSW handler to simulate a network error
      mswServer.use(
        rest.post<CommandExecution[]>(
          getMswURL(
            getUrl(mockInstanceId, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
          ),
          async (_req, res) => res.networkError(mockError),
        ),
      )

      const result = await commandsHistoryIndexedDB.addCommandsToHistory(
        mockInstanceId,
        commandExecutionType,
        mockCommandsStrings,
        {
          activeRunQueryMode: RunQueryMode.ASCII,
          resultsMode: ResultsMode.Default,
        },
      )

      expect(result.success).toBe(false)
      expect(result.error.message).toBe(mockError)
    })
  })

  describe('deleteCommandFromHistory', () => {
    it('should successfully delete command from history', async () => {
      mockedRemoveCommand.mockResolvedValue(undefined)

      const result = await commandsHistoryIndexedDB.deleteCommandFromHistory(
        mockInstanceId,
        mockCommandId,
      )

      expect(mockedRemoveCommand).toHaveBeenCalledWith(
        expect.any(Object),
        mockInstanceId,
        mockCommandId,
      )
      expect(result).toEqual({
        success: true,
      })
    })
  })

  describe('clearCommandsHistory', () => {
    it('should successfully clear commands history', async () => {
      mockedClearCommands.mockResolvedValue(undefined)

      const result =
        await commandsHistoryIndexedDB.clearCommandsHistory(mockInstanceId)

      expect(mockedClearCommands).toHaveBeenCalledWith(
        expect.any(Object),
        mockInstanceId,
      )
      expect(result).toEqual({
        success: true,
      })
    })
  })
})
