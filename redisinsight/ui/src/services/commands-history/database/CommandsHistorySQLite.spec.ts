import { rest } from 'msw'
import { faker } from '@faker-js/faker'

import { ApiEndpoints } from 'uiSrc/constants'
import { getUrl } from 'uiSrc/utils'
import {
  CommandExecution,
  CommandExecutionType,
  CommandExecutionUI,
  ResultsMode,
  RunQueryMode,
} from 'uiSrc/slices/interfaces'
import { commandExecutionFactory } from 'uiSrc/mocks/factories/workbench/commandExectution.factory'
import { mswServer } from 'uiSrc/mocks/server'
import { getMswURL } from 'uiSrc/utils/test-utils'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { CommandsHistorySQLite } from './CommandsHistorySQLite'

describe('CommandHistorySQLite', () => {
  let commandHistorySQLite: CommandsHistorySQLite
  const instanceId = INSTANCE_ID_MOCK

  beforeEach(() => {
    jest.clearAllMocks()

    commandHistorySQLite = new CommandsHistorySQLite()
  })

  describe('getCommandsHistory', () => {
    it('should successfully fetch and map command history', async () => {
      const commandExecutionType = faker.helpers.enumValue(CommandExecutionType)
      const mockCommands = [
        commandExecutionFactory.build({ id: '1', command: 'GET key1' }),
        commandExecutionFactory.build({ id: '2', command: 'SET key2 value' }),
      ]
      const expectedResultCommands = mockCommands.map((cmd) => ({
        ...cmd,
        emptyCommand: false,
        createdAt: cmd.createdAt.toISOString(),
      }))

      // Override the MSW handler to return our mock commands
      mswServer.use(
        rest.get<CommandExecution[]>(
          getMswURL(
            getUrl(instanceId, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
          ),
          async (_req, res, ctx) =>
            res(ctx.status(200), ctx.json(mockCommands)),
        ),
      )

      const result = await commandHistorySQLite.getCommandsHistory(
        instanceId,
        commandExecutionType,
      )

      expect(result).toEqual({
        success: true,
        data: expectedResultCommands,
      })
    })

    it.each([
      ['Workbench', CommandExecutionType.Workbench],
      ['Search', CommandExecutionType.Search],
    ])(
      'should fetch command history for %s type',
      async (_, commandExecutionType) => {
        const result = await commandHistorySQLite.getCommandsHistory(
          instanceId,
          commandExecutionType,
        )

        expect(result.success).toBe(true)
        expect(result.data?.length).toBeGreaterThan(0)
      },
    )

    it('should handle unsuccessful status code 400', async () => {
      const statusCode = 400

      // Override the MSW handler to return an error status
      mswServer.use(
        rest.get<CommandExecution[]>(
          getMswURL(
            getUrl(instanceId, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
          ),
          async (_req, res, ctx) => res(ctx.status(statusCode)),
        ),
      )

      const result = await commandHistorySQLite.getCommandsHistory(
        instanceId,
        CommandExecutionType.Workbench,
      )

      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(Error)
      expect(result.error?.message).toBe(
        `Request failed with status code ${statusCode}`,
      )
    })

    it('should handle network errors', async () => {
      const mockError = 'Network Error'

      // Override the MSW handler to simulate a network error
      mswServer.use(
        rest.get<CommandExecution[]>(
          getMswURL(
            getUrl(instanceId, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
          ),
          async (_req, res) => res.networkError(mockError),
        ),
      )

      const result = await commandHistorySQLite.getCommandsHistory(
        instanceId,
        CommandExecutionType.Workbench,
      )

      expect(result.success).toBe(false)
      expect(result.error.message).toBe(mockError)
    })

    it('should handle different instance IDs', async () => {
      const instanceId1 = 'instance-1'
      const instanceId2 = 'instance-2'

      const mockCommandExecutions1 = commandExecutionFactory.buildList(3)
      const mockCommandExecutions2 = commandExecutionFactory.buildList(3)

      const expectedResultCommands1 = mockCommandExecutions1.map((cmd) => ({
        ...cmd,
        emptyCommand: false,
        createdAt: cmd.createdAt.toISOString(),
      }))
      const expectedResultCommands2 = mockCommandExecutions2.map((cmd) => ({
        ...cmd,
        emptyCommand: false,
        createdAt: cmd.createdAt.toISOString(),
      }))

      // Override the MSW handler to return different data based on instance ID
      mswServer.use(
        rest.get<CommandExecution[]>(
          getMswURL(
            getUrl(instanceId1, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
          ),
          async (_req, res, ctx) =>
            res(ctx.status(200), ctx.json(mockCommandExecutions1)),
        ),
        rest.get<CommandExecution[]>(
          getMswURL(
            getUrl(instanceId2, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
          ),
          async (_req, res, ctx) =>
            res(ctx.status(200), ctx.json(mockCommandExecutions2)),
        ),
      )

      const result1 = await commandHistorySQLite.getCommandsHistory(
        instanceId1,
        CommandExecutionType.Workbench,
      )
      const result2 = await commandHistorySQLite.getCommandsHistory(
        instanceId2,
        CommandExecutionType.Search,
      )

      expect(result1).toEqual({
        success: true,
        data: expectedResultCommands1,
      })
      expect(result2).toEqual({
        success: true,
        data: expectedResultCommands2,
      })
    })
  })

  describe('addCommandsToHistory', () => {
    it('should successfully add commands to history and return mapped results', async () => {
      const commandExecutionType = faker.helpers.enumValue(CommandExecutionType)
      const mockCommands = [
        commandExecutionFactory.build({ id: '1', command: 'GET key1' }),
        commandExecutionFactory.build({ id: '2', command: 'SET key2 value' }),
      ]
      const mockCommandsStrings = mockCommands.map((cmd) => cmd.command)
      const expectedResultCommands = mockCommands.map((cmd) => ({
        ...cmd,
        emptyCommand: false,
        createdAt: cmd.createdAt.toISOString(),
      })) as unknown as CommandExecutionUI[]

      // Override the MSW handler to return our mock commands
      mswServer.use(
        rest.post<CommandExecution[]>(
          getMswURL(
            getUrl(instanceId, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
          ),
          async (_req, res, ctx) =>
            res(ctx.status(200), ctx.json(mockCommands)),
        ),
      )

      const result = await commandHistorySQLite.addCommandsToHistory(
        instanceId,
        commandExecutionType,
        mockCommandsStrings,
        {
          activeRunQueryMode: RunQueryMode.ASCII,
          resultsMode: ResultsMode.Default,
        },
      )

      expect(result).toEqual({
        success: true,
        data: expectedResultCommands,
      })
    })

    it.each([
      ['Workbench', CommandExecutionType.Workbench],
      ['Search', CommandExecutionType.Search],
    ])(
      'should add commands to history for %s type',
      async (_, commandExecutionType) => {
        const mockCommands = commandExecutionFactory.buildList(2)
        const mockCommandsStrings = mockCommands.map((cmd) => cmd.command)
        const expectedResultCommands = mockCommands.map((cmd) => ({
          ...cmd,
          emptyCommand: false,
          createdAt: cmd.createdAt.toISOString(),
        })) as unknown as CommandExecutionUI[]

        mswServer.use(
          rest.post<CommandExecution[]>(
            getMswURL(
              getUrl(instanceId, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
            ),
            async (_req, res, ctx) =>
              res(ctx.status(200), ctx.json(mockCommands)),
          ),
        )

        const result = await commandHistorySQLite.addCommandsToHistory(
          instanceId,
          commandExecutionType,
          mockCommandsStrings,
          {
            activeRunQueryMode: RunQueryMode.ASCII,
            resultsMode: ResultsMode.Default,
          },
        )

        expect(result.success).toBe(true)
        expect(result.data).toEqual(expectedResultCommands)
      },
    )

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
            getUrl(instanceId, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
          ),
          async (_req, res, ctx) => res(ctx.status(statusCode)),
        ),
      )

      const result = await commandHistorySQLite.addCommandsToHistory(
        instanceId,
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
            getUrl(instanceId, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
          ),
          async (_req, res) => res.networkError(mockError),
        ),
      )

      const result = await commandHistorySQLite.addCommandsToHistory(
        instanceId,
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

    it('should handle empty commands array', async () => {
      const commandExecutionType = CommandExecutionType.Workbench
      const emptyCommands: string[] = []

      mswServer.use(
        rest.post<CommandExecution[]>(
          getMswURL(
            getUrl(instanceId, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
          ),
          async (_req, res, ctx) =>
            res(ctx.status(200), ctx.json(emptyCommands)),
        ),
      )

      const result = await commandHistorySQLite.addCommandsToHistory(
        instanceId,
        commandExecutionType,
        emptyCommands,
        {
          activeRunQueryMode: RunQueryMode.ASCII,
          resultsMode: ResultsMode.Default,
        },
      )

      expect(result.success).toBe(true)
      expect(result.data).toEqual([])
    })

    it('should handle different instance IDs', async () => {
      const instanceId1 = 'instance-1'
      const instanceId2 = 'instance-2'
      const commandExecutionType = CommandExecutionType.Workbench

      const mockCommandExecutions1 = commandExecutionFactory.buildList(2)
      const mockCommandExecutions2 = commandExecutionFactory.buildList(2)

      const mockCommandsStrings1 = mockCommandExecutions1.map(
        (cmd) => cmd.command,
      )
      const mockCommandsStrings2 = mockCommandExecutions2.map(
        (cmd) => cmd.command,
      )

      const expectedResultCommands1 = mockCommandExecutions1.map((cmd) => ({
        ...cmd,
        emptyCommand: false,
        createdAt: cmd.createdAt.toISOString(),
      })) as unknown as CommandExecutionUI[]
      const expectedResultCommands2 = mockCommandExecutions2.map((cmd) => ({
        ...cmd,
        emptyCommand: false,
        createdAt: cmd.createdAt.toISOString(),
      })) as unknown as CommandExecutionUI[]

      // Override the MSW handler to return different data based on instance ID
      mswServer.use(
        rest.post<CommandExecution[]>(
          getMswURL(
            getUrl(instanceId1, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
          ),
          async (_req, res, ctx) =>
            res(ctx.status(200), ctx.json(mockCommandExecutions1)),
        ),
        rest.post<CommandExecution[]>(
          getMswURL(
            getUrl(instanceId2, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS),
          ),
          async (_req, res, ctx) =>
            res(ctx.status(200), ctx.json(mockCommandExecutions2)),
        ),
      )

      const result1 = await commandHistorySQLite.addCommandsToHistory(
        instanceId1,
        commandExecutionType,
        mockCommandsStrings1,
        {
          activeRunQueryMode: RunQueryMode.ASCII,
          resultsMode: ResultsMode.Default,
        },
      )
      const result2 = await commandHistorySQLite.addCommandsToHistory(
        instanceId2,
        commandExecutionType,
        mockCommandsStrings2,
        {
          activeRunQueryMode: RunQueryMode.ASCII,
          resultsMode: ResultsMode.Default,
        },
      )

      expect(result1).toEqual({
        success: true,
        data: expectedResultCommands1,
      })
      expect(result2).toEqual({
        success: true,
        data: expectedResultCommands2,
      })
    })
  })
})
