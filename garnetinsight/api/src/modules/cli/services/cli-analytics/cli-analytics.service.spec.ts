import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InternalServerErrorException } from '@nestjs/common';
import {
  mockRedisWrongTypeError,
  mockDatabase,
  MockType,
  mockSessionMetadata,
} from 'src/__mocks__';
import { CommandType, TelemetryEvents } from 'src/constants';
import { ReplyError } from 'src/models';
import { CommandParsingError } from 'src/modules/cli/constants/errors';
import {
  CommandExecutionStatus,
  ICliExecResultFromNode,
} from 'src/modules/cli/dto/cli.dto';
import { CommandsService } from 'src/modules/commands/commands.service';
import { CliAnalyticsService } from './cli-analytics.service';

const mockCommandsService = {
  getCommandsGroups: jest.fn(),
};

const redisReplyError: ReplyError = {
  ...mockRedisWrongTypeError,
  command: { name: 'sadd' },
};
const databaseId = mockDatabase.id;
const httpException = new InternalServerErrorException();
const mockCustomData = { data: 'Some data' };
const mockSetCommandName = 'set';
const mockAdditionalData = { command: mockSetCommandName };

describe('CliAnalyticsService', () => {
  let service: CliAnalyticsService;
  let sendEventMethod: jest.SpyInstance<CliAnalyticsService, unknown[]>;
  let sendFailedEventMethod: jest.SpyInstance<CliAnalyticsService, unknown[]>;
  let commandsService: MockType<CommandsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CommandsService,
          useFactory: () => mockCommandsService,
        },
        EventEmitter2,
        CliAnalyticsService,
      ],
    }).compile();

    service = module.get<CliAnalyticsService>(CliAnalyticsService);
    sendEventMethod = jest.spyOn<CliAnalyticsService, any>(
      service,
      'sendEvent',
    );
    sendFailedEventMethod = jest.spyOn<CliAnalyticsService, any>(
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

  describe('sendCliClientCreatedEvent', () => {
    it('should emit CliIndexInfoSubmitted event', () => {
      service.sendIndexInfoEvent(
        mockSessionMetadata,
        databaseId,
        mockCustomData,
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.CliIndexInfoSubmitted,
        {
          databaseId,
          ...mockCustomData,
        },
      );
    });
    it('should not fail and should not emit when there is no data', () => {
      service.sendIndexInfoEvent(mockSessionMetadata, databaseId, null);

      expect(sendEventMethod).not.toHaveBeenCalled();
    });
  });

  describe('sendCliClientCreatedEvent', () => {
    it('should emit CliClientCreated event', () => {
      service.sendClientCreatedEvent(
        mockSessionMetadata,
        databaseId,
        mockCustomData,
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.CliClientCreated,
        {
          databaseId,
          ...mockCustomData,
        },
      );
    });
    it('should emit CliClientCreated event without additional data', () => {
      service.sendClientCreatedEvent(mockSessionMetadata, databaseId);

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.CliClientCreated,
        {
          databaseId,
        },
      );
    });
  });

  describe('sendCliClientCreationFailedEvent', () => {
    it('should emit CliClientCreationFailed event', () => {
      service.sendClientCreationFailedEvent(
        mockSessionMetadata,
        databaseId,
        httpException,
        mockCustomData,
      );

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.CliClientCreationFailed,
        httpException,
        {
          databaseId,
          ...mockCustomData,
        },
      );
    });
    it('should emit CliClientCreationFailed event without additional data', () => {
      service.sendClientCreationFailedEvent(
        mockSessionMetadata,
        databaseId,
        httpException,
      );

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.CliClientCreationFailed,
        httpException,
        {
          databaseId,
        },
      );
    });
  });

  describe('sendCliClientRecreatedEvent', () => {
    it('should emit CliClientRecreated event', () => {
      service.sendClientRecreatedEvent(
        mockSessionMetadata,
        databaseId,
        mockCustomData,
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.CliClientRecreated,
        {
          databaseId,
          ...mockCustomData,
        },
      );
    });
    it('should emit CliClientRecreated event without additional data', () => {
      service.sendClientRecreatedEvent(mockSessionMetadata, databaseId);

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.CliClientRecreated,
        {
          databaseId,
        },
      );
    });
  });

  describe('sendCliClientDeletedEvent', () => {
    it('should emit CliClientDeleted event', () => {
      service.sendClientDeletedEvent(
        mockSessionMetadata,
        1,
        databaseId,
        mockCustomData,
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.CliClientDeleted,
        {
          databaseId,
          ...mockCustomData,
        },
      );
    });
    it('should emit CliClientDeleted event without additional data', () => {
      service.sendClientDeletedEvent(mockSessionMetadata, 1, databaseId);

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.CliClientDeleted,
        {
          databaseId,
        },
      );
    });
    it('should not emit event', () => {
      service.sendClientDeletedEvent(mockSessionMetadata, 0, databaseId);

      expect(sendEventMethod).not.toHaveBeenCalled();
    });
    it('should not emit event on invalid input values', () => {
      const input: any = {};
      service.sendClientDeletedEvent(mockSessionMetadata, input, databaseId);

      expect(() =>
        service.sendClientDeletedEvent(mockSessionMetadata, input, databaseId),
      ).not.toThrow();
      expect(sendEventMethod).not.toHaveBeenCalled();
    });
  });

  describe('sendCliCommandExecutedEvent', () => {
    it('should emit CliCommandExecuted event', async () => {
      await service.sendCommandExecutedEvent(
        mockSessionMetadata,
        databaseId,
        mockAdditionalData,
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.CliCommandExecuted,
        {
          databaseId,
          command: mockAdditionalData.command,
          commandType: CommandType.Core,
          moduleName: 'n/a',
          capability: 'string',
        },
      );
    });
    it('should emit CliCommandExecuted event without additional data', async () => {
      await service.sendCommandExecutedEvent(mockSessionMetadata, databaseId);

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.CliCommandExecuted,
        {
          databaseId,
        },
      );
    });
  });

  describe('sendCliCommandErrorEvent', () => {
    it('should emit CliCommandError event', async () => {
      await service.sendCommandErrorEvent(
        mockSessionMetadata,
        databaseId,
        redisReplyError,
        mockAdditionalData,
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.CliCommandErrorReceived,
        {
          databaseId,
          error: ReplyError.name,
          command: mockAdditionalData.command,
          commandType: CommandType.Core,
          moduleName: 'n/a',
          capability: 'string',
        },
      );
    });
    it('should emit CliCommandError event without additional data', async () => {
      await service.sendCommandErrorEvent(
        mockSessionMetadata,
        databaseId,
        redisReplyError,
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.CliCommandErrorReceived,
        {
          databaseId,
          error: ReplyError.name,
          command: 'sadd',
        },
      );
    });
    it('should emit event for custom error', async () => {
      const error: any = CommandParsingError;
      await service.sendCommandErrorEvent(
        mockSessionMetadata,
        databaseId,
        error,
        mockAdditionalData,
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.CliCommandErrorReceived,
        {
          databaseId,
          error: CommandParsingError.name,
          command: mockAdditionalData.command,
          commandType: CommandType.Core,
          moduleName: 'n/a',
          capability: 'string',
        },
      );
    });
  });

  describe('sendCliClientCreationFailedEvent', () => {
    it('should emit CliConnectionError event', async () => {
      await service.sendConnectionErrorEvent(
        mockSessionMetadata,
        databaseId,
        httpException,
        mockAdditionalData,
      );

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.CliClientConnectionError,
        httpException,
        {
          databaseId,
          command: mockAdditionalData.command,
          commandType: CommandType.Core,
          moduleName: 'n/a',
          capability: 'string',
        },
      );
    });
    it('should emit CliConnectionError event without additional data', async () => {
      await service.sendConnectionErrorEvent(
        mockSessionMetadata,
        databaseId,
        httpException,
      );

      expect(sendFailedEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.CliClientConnectionError,
        httpException,
        {
          databaseId,
        },
      );
    });
  });

  describe('sendCliClusterCommandExecutedEvent', () => {
    it('should emit success event', async () => {
      const nodExecResult: ICliExecResultFromNode = {
        response: '(integer) 5',
        host: '127.0.0.1',
        port: 7002,
        status: CommandExecutionStatus.Success,
      };

      await service.sendClusterCommandExecutedEvent(
        mockSessionMetadata,
        databaseId,
        nodExecResult,
        mockAdditionalData,
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.CliClusterNodeCommandExecuted,
        {
          databaseId,
          command: mockAdditionalData.command,
          commandType: CommandType.Core,
          moduleName: 'n/a',
          capability: 'string',
        },
      );
    });
    it('should emit event failed event for [RedisReply] error', async () => {
      const nodExecResult: ICliExecResultFromNode = {
        response: redisReplyError.message,
        host: '127.0.0.1',
        port: 7002,
        error: redisReplyError,
        status: CommandExecutionStatus.Fail,
      };

      await service.sendClusterCommandExecutedEvent(
        mockSessionMetadata,
        databaseId,
        nodExecResult,
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.CliCommandErrorReceived,
        {
          databaseId,
          error: redisReplyError.name,
          command: 'sadd',
        },
      );
    });
    it('should emit event failed for custom error', async () => {
      const nodExecResult: ICliExecResultFromNode = {
        response: redisReplyError.message,
        host: '127.0.0.1',
        port: 7002,
        error: CommandParsingError,
        status: CommandExecutionStatus.Fail,
      };

      await service.sendClusterCommandExecutedEvent(
        mockSessionMetadata,
        databaseId,
        nodExecResult,
      );

      expect(sendEventMethod).toHaveBeenCalledWith(
        mockSessionMetadata,
        TelemetryEvents.CliCommandErrorReceived,
        {
          databaseId,
          error: CommandParsingError.name,
        },
      );
    });
    it('should not emit event event', async () => {
      const nodExecResult: any = {
        response: redisReplyError.message,
        host: '127.0.0.1',
        port: 7002,
        status: 'undefined status',
      };
      await service.sendClusterCommandExecutedEvent(
        mockSessionMetadata,
        databaseId,
        nodExecResult,
      );

      expect(sendEventMethod).not.toHaveBeenCalled();
    });
  });
});
