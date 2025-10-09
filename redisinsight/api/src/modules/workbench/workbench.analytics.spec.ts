import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  mockRedisWrongTypeError,
  mockDatabase,
  MockType,
  mockSessionMetadata,
} from 'src/__mocks__';
import { CommandType, TelemetryEvents } from 'src/constants';
import { ReplyError } from 'src/models';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { CommandParsingError } from 'src/modules/cli/constants/errors';
import { CommandsService } from 'src/modules/commands/commands.service';
import { WorkbenchAnalytics } from './workbench.analytics';
import { CommandExecutionType } from './models/command-execution';

const redisReplyError: ReplyError = {
  ...mockRedisWrongTypeError,
  command: { name: 'sadd' },
};
const instanceId = mockDatabase.id;

const mockCommandsService = {
  getCommandsGroups: jest.fn(),
};

describe('WorkbenchAnalytics', () => {
  let service: WorkbenchAnalytics;
  let sendEventMethod: jest.SpyInstance<WorkbenchAnalytics, unknown[]>;
  let sendFailedEventMethod: jest.SpyInstance<WorkbenchAnalytics, unknown[]>;
  let commandsService: MockType<CommandsService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventEmitter2,
        {
          provide: CommandsService,
          useFactory: () => mockCommandsService,
        },
        WorkbenchAnalytics,
      ],
    }).compile();

    service = module.get<WorkbenchAnalytics>(WorkbenchAnalytics);
    sendEventMethod = jest.spyOn<WorkbenchAnalytics, any>(service, 'sendEvent');
    sendFailedEventMethod = jest.spyOn<WorkbenchAnalytics, any>(
      service,
      'sendFailedEvent',
    );

    commandsService = module.get(CommandsService);
    commandsService.getCommandsGroups.mockResolvedValue({
      main: {
        SET: {
          summary: 'Set the string value of a key',
          since: '1.0.0',
          group: 'string',
          complexity: 'O(1)',
          acl_categories: ['@write', '@string', '@slow'],
        },
      },
      redisbloom: {
        'BF.RESERVE': {
          summary: 'Creates a new Bloom Filter',
          complexity: 'O(1)',
          since: '1.0.0',
          group: 'bf',
        },
      },
      custommodule: {
        'CUSTOM.COMMAND': {
          summary: 'Creates a new Bloom Filter',
          complexity: 'O(1)',
          since: '1.0.0',
        },
      },
    });
  });

  describe('sendIndexInfoEvent', () => {
    it('should emit index info event', async () => {
      service.sendIndexInfoEvent(mockSessionMetadata, instanceId, {
        any: 'fields',
      });

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.WorkbenchIndexInfoSubmitted,
        {
          databaseId: instanceId,
          any: 'fields',
        },
      );
    });
    it('should not fail and should not emit when no data to send', async () => {
      service.sendIndexInfoEvent(mockSessionMetadata, instanceId, null);

      expect(sendEventMethod).not.toHaveBeenCalled();
    });
  });
  describe('sendCommandExecutedEvents', () => {
    it('should emit multiple Workbench events', async () => {
      await service.sendCommandExecutedEvents(
        mockSessionMetadata,
        instanceId,
        CommandExecutionType.Workbench,
        [
          { response: 'OK', status: CommandExecutionStatus.Success },
          { response: 'OK', status: CommandExecutionStatus.Success },
        ],
        { command: 'set' },
      );

      expect(sendEventMethod).toHaveBeenCalledTimes(2);
      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.WorkbenchCommandExecuted,
        {
          databaseId: instanceId,
          command: 'set',
          commandType: CommandType.Core,
          moduleName: 'n/a',
          capability: 'string',
        },
      );
    });
    it('should emit multiple Search events', async () => {
      await service.sendCommandExecutedEvents(
        mockSessionMetadata,
        instanceId,
        CommandExecutionType.Search,
        [
          { response: 'OK', status: CommandExecutionStatus.Success },
          { response: 'OK', status: CommandExecutionStatus.Success },
        ],
        { command: 'set' },
      );

      expect(sendEventMethod).toHaveBeenCalledTimes(2);
      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.SearchCommandExecuted,
        {
          databaseId: instanceId,
          command: 'set',
          commandType: CommandType.Core,
          moduleName: 'n/a',
          capability: 'string',
        },
      );
    });
  });
  describe('sendCommandExecutedEvent', () => {
    it('should emit WorkbenchCommandExecuted event', async () => {
      await service.sendCommandExecutedEvent(
        mockSessionMetadata,
        instanceId,
        CommandExecutionType.Workbench,
        { response: 'OK', status: CommandExecutionStatus.Success },
        { command: 'set' },
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.WorkbenchCommandExecuted,
        {
          databaseId: instanceId,
          command: 'set',
          commandType: CommandType.Core,
          moduleName: 'n/a',
          capability: 'string',
        },
      );
    });
    it('should emit event if failed to fetch commands groups', async () => {
      commandsService.getCommandsGroups.mockRejectedValue(
        new Error('some error'),
      );

      await service.sendCommandExecutedEvent(
        mockSessionMetadata,
        instanceId,
        CommandExecutionType.Workbench,
        { response: 'OK', status: CommandExecutionStatus.Success },
        { command: 'set' },
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.WorkbenchCommandExecuted,
        {
          databaseId: instanceId,
          command: 'set',
        },
      );
    });
    it('should emit WorkbenchCommandExecuted event (module with cap.)', async () => {
      await service.sendCommandExecutedEvent(
        mockSessionMetadata,
        instanceId,
        CommandExecutionType.Workbench,
        { response: 'OK', status: CommandExecutionStatus.Success },
        { command: 'bF.rEsErvE' },
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.WorkbenchCommandExecuted,
        {
          databaseId: instanceId,
          command: 'bF.rEsErvE',
          commandType: CommandType.Module,
          moduleName: 'redisbloom',
          capability: 'bf',
        },
      );
    });
    it('should emit WorkbenchCommandExecuted event (module w\\o cap.)', async () => {
      await service.sendCommandExecutedEvent(
        mockSessionMetadata,
        instanceId,
        CommandExecutionType.Workbench,
        { response: 'OK', status: CommandExecutionStatus.Success },
        { command: 'CUSTOM.COMMAnd' },
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.WorkbenchCommandExecuted,
        {
          databaseId: instanceId,
          command: 'CUSTOM.COMMAnd',
          commandType: CommandType.Module,
          moduleName: 'custommodule',
          capability: 'n/a',
        },
      );
    });
    it('should emit WorkbenchCommandExecuted event (custom module)', async () => {
      await service.sendCommandExecutedEvent(
        mockSessionMetadata,
        instanceId,
        CommandExecutionType.Workbench,
        { response: 'OK', status: CommandExecutionStatus.Success },
        { command: 'some.command' },
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.WorkbenchCommandExecuted,
        {
          databaseId: instanceId,
          command: 'some.command',
          commandType: CommandType.Module,
          moduleName: 'custom',
          capability: 'n/a',
        },
      );
    });
    it('should emit WorkbenchCommandExecuted event without additional data', async () => {
      await service.sendCommandExecutedEvent(
        mockSessionMetadata,
        instanceId,
        CommandExecutionType.Workbench,
        {
          response: 'OK',
          status: CommandExecutionStatus.Success,
        },
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.WorkbenchCommandExecuted,
        {
          databaseId: instanceId,
        },
      );
    });
    it('should emit WorkbenchCommandError event', async () => {
      await service.sendCommandExecutedEvent(
        mockSessionMetadata,
        instanceId,
        CommandExecutionType.Workbench,
        {
          response: 'Error',
          error: redisReplyError,
          status: CommandExecutionStatus.Fail,
        },
        { command: 'set', data: 'Some data' },
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.WorkbenchCommandErrorReceived,
        {
          databaseId: instanceId,
          error: ReplyError.name,
          command: 'set',
          commandType: CommandType.Core,
          moduleName: 'n/a',
          capability: 'string',
          data: 'Some data',
        },
      );
    });
    it('should emit WorkbenchCommandError event without additional data', async () => {
      await service.sendCommandExecutedEvent(
        mockSessionMetadata,
        instanceId,
        CommandExecutionType.Workbench,
        {
          response: 'Error',
          error: redisReplyError,
          status: CommandExecutionStatus.Fail,
        },
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.WorkbenchCommandErrorReceived,
        {
          databaseId: instanceId,
          error: ReplyError.name,
          command: 'sadd',
        },
      );
    });
    it('should emit WorkbenchCommandError event for custom error', async () => {
      const error: any = CommandParsingError;
      await service.sendCommandExecutedEvent(
        mockSessionMetadata,
        instanceId,
        CommandExecutionType.Workbench,
        {
          response: 'Error',
          status: CommandExecutionStatus.Fail,
          error,
        },
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.WorkbenchCommandErrorReceived,
        {
          databaseId: instanceId,
          error: CommandParsingError.name,
          command: undefined,
        },
      );
    });
    it('should emit WorkbenchCommandError event for HttpException', async () => {
      const error = new ServiceUnavailableException();
      await service.sendCommandExecutedEvent(
        mockSessionMetadata,
        instanceId,
        CommandExecutionType.Workbench,
        {
          response: 'Error',
          status: CommandExecutionStatus.Fail,
          error,
        },
      );

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.WorkbenchCommandErrorReceived,
        error,
        { databaseId: instanceId },
      );
    });
    it('should emit SearchCommandExecuted event', async () => {
      await service.sendCommandExecutedEvent(
        mockSessionMetadata,
        instanceId,
        CommandExecutionType.Search,
        { response: 'OK', status: CommandExecutionStatus.Success },
        { command: 'set' },
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.SearchCommandExecuted,
        {
          databaseId: instanceId,
          command: 'set',
          commandType: CommandType.Core,
          moduleName: 'n/a',
          capability: 'string',
        },
      );
    });
    it('should emit SearchCommandError event', async () => {
      await service.sendCommandExecutedEvent(
        mockSessionMetadata,
        instanceId,
        CommandExecutionType.Search,
        {
          response: 'Error',
          error: redisReplyError,
          status: CommandExecutionStatus.Fail,
        },
        { command: 'set', data: 'Some data' },
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.SearchCommandErrorReceived,
        {
          databaseId: instanceId,
          error: ReplyError.name,
          command: 'set',
          commandType: CommandType.Core,
          moduleName: 'n/a',
          capability: 'string',
          data: 'Some data',
        },
      );
    });
  });
  describe('sendCommandDeletedEvent', () => {
    it('should emit WorkbenchCommandDeleted event', () => {
      service.sendCommandDeletedEvent(mockSessionMetadata, instanceId, {
        command: 'info',
      });

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.WorkbenchCommandDeleted,
        {
          databaseId: instanceId,
          command: 'info',
        },
      );
    });
    it('should emit WorkbenchCommandDeleted event without additional data', () => {
      service.sendCommandDeletedEvent(mockSessionMetadata, instanceId);

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.WorkbenchCommandDeleted,
        {
          databaseId: instanceId,
        },
      );
    });
  });
});
