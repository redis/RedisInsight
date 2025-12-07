import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import {
  mockCommandExecution,
  mockCommandExecutionFilter,
  mockCommandExecutionRepository,
  mockCommandExecutionSuccessResult,
  mockCreateCommandExecutionDto,
  mockDatabaseClientFactory,
  mockStandaloneRedisClient,
  MockType,
  mockWorkbenchAnalyticsService,
  mockWorkbenchClientMetadata,
  mockWorkbenchCommandsExecutor,
} from 'src/__mocks__';
import { WorkbenchService } from 'src/modules/workbench/workbench.service';
import { WorkbenchCommandsExecutor } from 'src/modules/workbench/providers/workbench-commands.executor';
import { CommandExecutionRepository } from 'src/modules/workbench/repositories/command-execution.repository';
import {
  ResultsMode,
  RunQueryMode,
} from 'src/modules/workbench/models/command-execution';
import { CommandExecutionResult } from 'src/modules/workbench/models/command-execution-result';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { CreateCommandExecutionsDto } from 'src/modules/workbench/dto/create-command-executions.dto';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { WorkbenchAnalytics } from 'src/modules/workbench/workbench.analytics';

const mockCommands = ['set 1 1', 'get 1'];

const mockCreateCommandExecutionDtoWithGroupMode: CreateCommandExecutionsDto = {
  commands: mockCommands,
  mode: RunQueryMode.ASCII,
  resultsMode: ResultsMode.GroupMode,
};

const mockCreateCommandExecutionDtoWithSilentMode: CreateCommandExecutionsDto =
  {
    commands: mockCommands,
    mode: RunQueryMode.ASCII,
    resultsMode: ResultsMode.Silent,
  };

const mockCreateCommandExecutionsDto: CreateCommandExecutionsDto = {
  commands: [
    mockCreateCommandExecutionDto.command,
    mockCreateCommandExecutionDto.command,
  ],
  ...mockCreateCommandExecutionDto,
};

const mockCommandExecutionResults: CommandExecutionResult[] = [
  mockCommandExecutionSuccessResult,
];

const mockSendCommandResultSuccess = { response: '1', status: 'success' };
const mockSendCommandResultFail = { response: 'error', status: 'fail' };

const mockCommandExecutionWithGroupMode = {
  mode: 'ASCII',
  commands: mockCommands,
  resultsMode: 'GROUP_MODE',
  databaseId: 'd05043d0 - 0d12- 4ce1-9ca3 - 30c6d7e391ea',
  summary: { total: 2, success: 1, fail: 1 },
  command: 'set 1 1\r\nget 1',
  result: [
    {
      status: 'success',
      response: [
        { response: 'OK', status: 'success', command: 'set 1 1' },
        { response: 'error', status: 'fail', command: 'get 1' },
      ],
    },
  ],
};

const mockCommandExecutionWithSilentMode = {
  mode: 'ASCII',
  commands: mockCommands,
  resultsMode: 'GROUP_MODE',
  databaseId: 'd05043d0 - 0d12- 4ce1-9ca3 - 30c6d7e391ea',
  summary: { total: 2, success: 1, fail: 1 },
  command: 'set 1 1\r\nget 1',
  result: [
    {
      status: 'success',
      response: [{ response: 'error', status: 'fail', command: 'get 1' }],
    },
  ],
};

describe('WorkbenchService', () => {
  let service: WorkbenchService;
  let workbenchCommandsExecutor: MockType<WorkbenchCommandsExecutor>;
  let commandExecutionRepository: MockType<CommandExecutionRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkbenchService,
        {
          provide: WorkbenchAnalytics,
          useFactory: mockWorkbenchAnalyticsService,
        },
        {
          provide: WorkbenchCommandsExecutor,
          useFactory: mockWorkbenchCommandsExecutor,
        },
        {
          provide: CommandExecutionRepository,
          useFactory: mockCommandExecutionRepository,
        },
        {
          provide: DatabaseClientFactory,
          useFactory: mockDatabaseClientFactory,
        },
      ],
    }).compile();

    service = module.get(WorkbenchService);
    workbenchCommandsExecutor = module.get(WorkbenchCommandsExecutor);
    commandExecutionRepository = module.get(CommandExecutionRepository);
  });

  describe('createCommandExecution', () => {
    it('should successfully execute command and save it', async () => {
      const result = await service.createCommandExecution(
        mockStandaloneRedisClient,
        mockCreateCommandExecutionDto,
      );
      expect(result).toEqual({
        ...mockCommandExecution,
        executionTime: result.executionTime,
        id: undefined, // result was not saved yet
        createdAt: undefined, // result was not saved yet
      });
    });
    it('should save db index', async () => {
      const db = 2;
      mockStandaloneRedisClient.getCurrentDbIndex.mockResolvedValueOnce(db);
      const result = await service.createCommandExecution(
        mockStandaloneRedisClient,
        mockCreateCommandExecutionDto,
      );
      expect(result).toEqual({
        ...mockCommandExecution,
        executionTime: result.executionTime,
        id: undefined, // result was not saved yet
        createdAt: undefined, // result was not saved yet
        db,
      });
    });
    it('should save result as unsupported command message', async () => {
      mockStandaloneRedisClient.getCurrentDbIndex = jest
        .fn()
        .mockResolvedValueOnce(0);
      workbenchCommandsExecutor.sendCommand.mockResolvedValueOnce(
        mockCommandExecutionResults,
      );

      const dto = {
        ...mockCommandExecutionResults,
        command: 'subscribe',
        mode: RunQueryMode.ASCII,
      };

      expect(
        await service.createCommandExecution(mockStandaloneRedisClient, dto),
      ).toEqual({
        ...dto,
        db: 0,
        databaseId: mockWorkbenchClientMetadata.databaseId,
        result: [
          {
            response: ERROR_MESSAGES.WORKBENCH_COMMAND_NOT_SUPPORTED(
              dto.command.toUpperCase(),
            ),
            status: CommandExecutionStatus.Fail,
          },
        ],
      });
    });
    it('should throw an error when command execution failed', async () => {
      workbenchCommandsExecutor.sendCommand.mockRejectedValueOnce(
        new BadRequestException('error'),
      );

      const dto = {
        ...mockCommandExecutionResults,
        command: 'scan 0',
        mode: RunQueryMode.ASCII,
      };

      try {
        await service.createCommandExecution(mockStandaloneRedisClient, dto);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });
  });
  describe('createCommandExecutions', () => {
    it('should successfully execute commands and save them', async () => {
      workbenchCommandsExecutor.sendCommand.mockResolvedValueOnce([
        mockCommandExecutionResults,
        mockCommandExecutionResults,
      ]);
      commandExecutionRepository.createMany.mockResolvedValueOnce([
        mockCommandExecution,
        mockCommandExecution,
      ]);

      const result = await service.createCommandExecutions(
        mockWorkbenchClientMetadata,
        mockCreateCommandExecutionsDto,
      );

      expect(result).toEqual([mockCommandExecution, mockCommandExecution]);
    });
    it('should successfully execute commands and save in group mode view', async () => {
      when(workbenchCommandsExecutor.sendCommand)
        .calledWith(mockStandaloneRedisClient, expect.anything())
        .mockResolvedValue([mockSendCommandResultSuccess]);

      commandExecutionRepository.createMany.mockResolvedValueOnce([
        mockCommandExecutionWithGroupMode,
      ]);

      const result = await service.createCommandExecutions(
        mockWorkbenchClientMetadata,
        mockCreateCommandExecutionDtoWithGroupMode,
      );

      expect(result).toEqual([mockCommandExecutionWithGroupMode]);
    });
    it('should successfully execute commands and save in silent mode view', async () => {
      when(workbenchCommandsExecutor.sendCommand)
        .calledWith(mockStandaloneRedisClient, expect.anything())
        .mockResolvedValue([mockSendCommandResultSuccess]);

      commandExecutionRepository.createMany.mockResolvedValueOnce([
        mockCommandExecutionWithSilentMode,
      ]);

      const result = await service.createCommandExecutions(
        mockWorkbenchClientMetadata,
        mockCreateCommandExecutionDtoWithSilentMode,
      );

      expect(result).toEqual([mockCommandExecutionWithSilentMode]);
    });

    it('should successfully execute commands with error and save summary', async () => {
      when(workbenchCommandsExecutor.sendCommand)
        .calledWith(mockStandaloneRedisClient, {
          ...mockCreateCommandExecutionDtoWithGroupMode,
          command: mockCommands[0],
        })
        .mockResolvedValue([mockSendCommandResultSuccess]);

      when(workbenchCommandsExecutor.sendCommand)
        .calledWith(mockStandaloneRedisClient, {
          ...mockCreateCommandExecutionDtoWithGroupMode,
          command: mockCommands[1],
        })
        .mockResolvedValue([mockSendCommandResultFail]);

      commandExecutionRepository.createMany.mockResolvedValueOnce([
        mockCommandExecutionWithGroupMode,
      ]);

      const result = await service.createCommandExecutions(
        mockWorkbenchClientMetadata,
        mockCreateCommandExecutionDtoWithGroupMode,
      );

      expect(result).toEqual([mockCommandExecutionWithGroupMode]);
    });

    it('should successfully execute commands with error and save summary in silent mode view', async () => {
      when(workbenchCommandsExecutor.sendCommand)
        .calledWith(mockStandaloneRedisClient, {
          ...mockCreateCommandExecutionDtoWithSilentMode,
          command: mockCommands[0],
        })
        .mockResolvedValue([mockSendCommandResultSuccess]);

      when(workbenchCommandsExecutor.sendCommand)
        .calledWith(mockStandaloneRedisClient, {
          ...mockCreateCommandExecutionDtoWithSilentMode,
          command: mockCommands[1],
        })
        .mockResolvedValue([mockSendCommandResultFail]);

      commandExecutionRepository.createMany.mockResolvedValueOnce([
        mockCommandExecutionWithSilentMode,
      ]);

      const result = await service.createCommandExecutions(
        mockWorkbenchClientMetadata,
        mockCreateCommandExecutionDtoWithSilentMode,
      );

      expect(result).toEqual([mockCommandExecutionWithSilentMode]);
    });

    it('should throw an error when command execution failed', async () => {
      workbenchCommandsExecutor.sendCommand.mockRejectedValueOnce(
        new BadRequestException('error'),
      );

      try {
        await service.createCommandExecutions(
          mockWorkbenchClientMetadata,
          mockCreateCommandExecutionsDto,
        );
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });
    it('should throw an error from command execution provider (create)', async () => {
      workbenchCommandsExecutor.sendCommand.mockResolvedValueOnce([
        mockCommandExecutionResults,
      ]);
      commandExecutionRepository.createMany.mockRejectedValueOnce(
        new InternalServerErrorException('db error'),
      );

      try {
        await service.createCommandExecutions(
          mockWorkbenchClientMetadata,
          mockCreateCommandExecutionsDto,
        );
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });
  describe('listCommandExecutions', () => {
    it('should return list of command executions', async () => {
      commandExecutionRepository.getList.mockResolvedValueOnce([
        mockCommandExecution,
        mockCommandExecution,
      ]);

      const result = await service.listCommandExecutions(
        mockWorkbenchClientMetadata,
        mockCommandExecutionFilter,
      );

      expect(result).toEqual([mockCommandExecution, mockCommandExecution]);
    });
    it('should throw an error from command execution provider (getList)', async () => {
      commandExecutionRepository.getList.mockRejectedValueOnce(
        new InternalServerErrorException(),
      );

      try {
        await service.listCommandExecutions(
          mockWorkbenchClientMetadata,
          mockCommandExecutionFilter,
        );
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });
  describe('getCommandExecution', () => {
    it('should return full command executions', async () => {
      commandExecutionRepository.getOne.mockResolvedValueOnce(
        mockCommandExecution,
      );

      const result = await service.getCommandExecution(
        mockWorkbenchClientMetadata,
        mockCommandExecution.id,
      );

      expect(result).toEqual(mockCommandExecution);
    });
    it('should throw an error from command execution provider (getOne)', async () => {
      commandExecutionRepository.getOne.mockRejectedValueOnce(
        new InternalServerErrorException(),
      );

      try {
        await service.getCommandExecution(
          mockWorkbenchClientMetadata,
          mockCommandExecution.id,
        );
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });
  describe('deleteCommandExecution', () => {
    it('should not return anything on delete', async () => {
      commandExecutionRepository.delete.mockResolvedValueOnce('some response');

      const result = await service.deleteCommandExecution(
        mockWorkbenchClientMetadata,
        mockCommandExecution.id,
      );

      expect(result).toEqual(undefined);
    });
  });
  describe('deleteCommandExecutions', () => {
    it('should not return anything on delete', async () => {
      commandExecutionRepository.deleteAll.mockResolvedValueOnce(
        'some response',
      );

      const result = await service.deleteCommandExecutions(
        mockWorkbenchClientMetadata,
        mockCommandExecutionFilter,
      );

      expect(result).toEqual(undefined);
    });
  });
});
