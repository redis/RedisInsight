import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { get } from 'lodash';

import { when } from 'jest-when';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  mockRedisServerInfoResponse,
  mockRedisWrongTypeError,
  mockCliAnalyticsService,
  MockType,
  mockDatabaseRecommendationService,
  mockCliClientMetadata,
  mockDatabaseClientFactory,
  mockStandaloneRedisClient,
  mockClusterRedisClient,
  mockRedisFtInfoReply,
  mockFtInfoAnalyticsData,
  mockSessionMetadata,
} from 'src/__mocks__';
import {
  CommandExecutionStatus,
  SendCommandDto,
  SendCommandResponse,
} from 'src/modules/cli/dto/cli.dto';
import { ReplyError } from 'src/models';
import { CliToolUnsupportedCommands } from 'src/modules/cli/utils/getUnsupportedCommands';
import {
  CommandNotSupportedError,
  CommandParsingError,
} from 'src/modules/cli/constants/errors';
import { RECOMMENDATION_NAMES, unknownCommand } from 'src/constants';
import { CliAnalyticsService } from 'src/modules/cli/services/cli-analytics/cli-analytics.service';
import { KeytarUnavailableException } from 'src/modules/encryption/exceptions';
import { CommandsService } from 'src/modules/commands/commands.service';
import { DatabaseRecommendationService } from 'src/modules/database-recommendation/database-recommendation.service';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { OutputFormatterManager } from './output-formatter/output-formatter-manager';
import {
  CliOutputFormatterTypes,
  IOutputFormatterStrategy,
} from './output-formatter/output-formatter.interface';
import { CliBusinessService } from './cli-business.service';

jest.mock(
  'uuid',
  jest.fn(() => ({
    ...(jest.requireActual('uuid') as object),
    v4: jest.fn().mockReturnValue('68df9760-b7fa-4300-9841-0b726e0d8b67'),
  })),
);

const mockCommandsService = () => ({
  getCommandsGroups: jest.fn(),
});

const mockENotFoundMessage = 'ENOTFOUND some message';
const mockMemoryUsageCommand = 'memory usage key';
const mockGetEscapedKeyCommand = 'get "\\\\key';
const mockServerInfoCommand = 'info server';
const mockIntegerResponse = 5;

describe('CliBusinessService', () => {
  const standaloneClient = mockStandaloneRedisClient;
  const clusterClient = mockClusterRedisClient;
  let service: CliBusinessService;
  let databaseClientFactory: DatabaseClientFactory;
  let recommendationService;
  let rawFormatter: IOutputFormatterStrategy;
  let analyticsService: MockType<CliAnalyticsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CliBusinessService,
        {
          provide: CliAnalyticsService,
          useFactory: mockCliAnalyticsService,
        },
        {
          provide: DatabaseClientFactory,
          useFactory: mockDatabaseClientFactory,
        },
        {
          provide: CommandsService,
          useFactory: mockCommandsService,
        },
        {
          provide: DatabaseRecommendationService,
          useFactory: mockDatabaseRecommendationService,
        },
      ],
    }).compile();

    service = module.get<CliBusinessService>(CliBusinessService);
    databaseClientFactory = module.get<DatabaseClientFactory>(
      DatabaseClientFactory,
    );
    analyticsService = module.get(CliAnalyticsService);
    recommendationService = module.get<DatabaseRecommendationService>(
      DatabaseRecommendationService,
    );

    clusterClient.nodes.mockReturnValue([
      mockStandaloneRedisClient,
      mockStandaloneRedisClient,
    ]);

    const outputFormatterManager: OutputFormatterManager = get(
      service,
      'outputFormatterManager',
    );
    rawFormatter = outputFormatterManager.getStrategy(
      CliOutputFormatterTypes.Raw,
    );
  });

  describe('getClient', () => {
    it('should successfully create new redis client', async () => {
      databaseClientFactory.getOrCreateClient = jest
        .fn()
        .mockResolvedValue(standaloneClient);

      const result = await service.getClient(mockCliClientMetadata);

      expect(result).toEqual({ uuid: mockCliClientMetadata.uniqueId });
      expect(analyticsService.sendClientCreatedEvent).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockCliClientMetadata.databaseId,
      );
    });

    it('should throw internal exception on getClient error', async () => {
      databaseClientFactory.getOrCreateClient = jest
        .fn()
        .mockRejectedValue(
          new InternalServerErrorException(mockENotFoundMessage),
        );

      try {
        await service.getClient(mockCliClientMetadata);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
        expect(
          analyticsService.sendClientCreationFailedEvent,
        ).toHaveBeenCalledWith(
          mockSessionMetadata,
          mockCliClientMetadata.databaseId,
          new InternalServerErrorException(mockENotFoundMessage),
        );
      }
    });

    it('Should proxy EncryptionService errors on getClient', async () => {
      databaseClientFactory.getOrCreateClient = jest
        .fn()
        .mockRejectedValue(new KeytarUnavailableException());

      try {
        await service.getClient(mockCliClientMetadata);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(KeytarUnavailableException);
        expect(
          analyticsService.sendClientCreationFailedEvent,
        ).toHaveBeenCalledWith(
          mockSessionMetadata,
          mockCliClientMetadata.databaseId,
          new KeytarUnavailableException(),
        );
      }
    });
  });

  describe('reCreateClient', () => {
    it('should successfully create new redis client', async () => {
      databaseClientFactory.deleteClient = jest.fn().mockResolvedValue(1);
      databaseClientFactory.getOrCreateClient = jest
        .fn()
        .mockResolvedValue(standaloneClient);

      const result = await service.reCreateClient(mockCliClientMetadata);

      expect(result).toEqual({ uuid: mockCliClientMetadata.uniqueId });
      expect(analyticsService.sendClientRecreatedEvent).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockCliClientMetadata.databaseId,
      );
    });

    it('should throw internal exception on reCreateClient', async () => {
      databaseClientFactory.deleteClient = jest.fn().mockResolvedValue(1);
      databaseClientFactory.getOrCreateClient = jest
        .fn()
        .mockRejectedValue(
          new InternalServerErrorException(mockENotFoundMessage),
        );

      try {
        await service.reCreateClient(mockCliClientMetadata);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
        expect(
          analyticsService.sendClientCreationFailedEvent,
        ).toHaveBeenCalledWith(
          mockSessionMetadata,
          mockCliClientMetadata.databaseId,
          new InternalServerErrorException(mockENotFoundMessage),
        );
      }
    });

    it('Should proxy EncryptionService errors on reCreateClient', async () => {
      databaseClientFactory.deleteClient = jest.fn().mockResolvedValue(1);
      databaseClientFactory.getOrCreateClient = jest
        .fn()
        .mockRejectedValue(new KeytarUnavailableException());

      try {
        await service.reCreateClient(mockCliClientMetadata);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(KeytarUnavailableException);
        expect(
          analyticsService.sendClientCreationFailedEvent,
        ).toHaveBeenCalledWith(
          mockSessionMetadata,
          mockCliClientMetadata.databaseId,
          new KeytarUnavailableException(),
        );
      }
    });
  });

  describe('deleteClient', () => {
    it('should successfully close redis client', async () => {
      databaseClientFactory.deleteClient = jest.fn().mockResolvedValue(1);

      const result = await service.deleteClient(mockCliClientMetadata);

      expect(result).toEqual({ affected: 1 });
      expect(analyticsService.sendClientDeletedEvent).toHaveBeenCalledWith(
        mockSessionMetadata,
        1,
        mockCliClientMetadata.databaseId,
      );
    });

    it('should throw internal exception on deleteClient', async () => {
      databaseClientFactory.deleteClient = jest
        .fn()
        .mockRejectedValue(new Error(mockENotFoundMessage));

      try {
        await service.deleteClient(mockCliClientMetadata);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
        expect(analyticsService.sendClientDeletedEvent).not.toHaveBeenCalled();
      }
    });
  });

  describe('sendCommand', () => {
    it('should successfully execute ft.info command', async () => {
      const dto: SendCommandDto = { command: 'ft.info idx' };
      const formatSpy = jest.spyOn(rawFormatter, 'format');
      const mockResult: SendCommandResponse = {
        response: mockRedisFtInfoReply,
        status: CommandExecutionStatus.Success,
      };
      when(standaloneClient.sendCommand)
        .calledWith(['ft.info', 'idx'], expect.anything())
        .mockReturnValue(mockRedisFtInfoReply);

      const result = await service.sendCommand(mockCliClientMetadata, dto);

      expect(result).toEqual(mockResult);
      expect(formatSpy).toHaveBeenCalled();
      expect(analyticsService.sendCommandExecutedEvent).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockCliClientMetadata.databaseId,
        {
          command: 'ft.info',
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
      expect(analyticsService.sendIndexInfoEvent).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockCliClientMetadata.databaseId,
        mockFtInfoAnalyticsData,
      );
    });

    it('should successfully execute command (RAW format)', async () => {
      const dto: SendCommandDto = { command: mockMemoryUsageCommand };
      const formatSpy = jest.spyOn(rawFormatter, 'format');
      const mockResult: SendCommandResponse = {
        response: mockIntegerResponse,
        status: CommandExecutionStatus.Success,
      };
      when(standaloneClient.sendCommand)
        .calledWith(['memory', 'usage', 'key'], expect.anything())
        .mockReturnValue(5);

      const result = await service.sendCommand(mockCliClientMetadata, dto);

      expect(result).toEqual(mockResult);
      expect(formatSpy).toHaveBeenCalled();
      expect(analyticsService.sendCommandExecutedEvent).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockCliClientMetadata.databaseId,
        {
          command: 'memory',
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });

    it('should successfully execute command and return raw response', async () => {
      const dto: SendCommandDto = {
        command: mockMemoryUsageCommand,
        outputFormat: CliOutputFormatterTypes.Raw,
      };
      const formatSpy = jest.spyOn(rawFormatter, 'format');
      const mockResult: SendCommandResponse = {
        response: 5,
        status: CommandExecutionStatus.Success,
      };
      when(standaloneClient.sendCommand)
        .calledWith(['memory', 'usage', 'key'], expect.anything())
        .mockReturnValue(5);

      const result = await service.sendCommand(mockCliClientMetadata, dto);

      expect(result).toEqual(mockResult);
      expect(formatSpy).toHaveBeenCalled();
      expect(analyticsService.sendCommandExecutedEvent).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockCliClientMetadata.databaseId,
        {
          command: 'memory',
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });

    it('should return response with [CLI_COMMAND_NOT_SUPPORTED] error for sendCommand', async () => {
      const command = CliToolUnsupportedCommands.ScriptDebug;
      const dto: SendCommandDto = { command };
      const mockResult: SendCommandResponse = {
        response: ERROR_MESSAGES.CLI_COMMAND_NOT_SUPPORTED(
          command.toUpperCase(),
        ),
        status: CommandExecutionStatus.Fail,
      };

      const result = await service.sendCommand(mockCliClientMetadata, dto);

      expect(result).toEqual(mockResult);
      expect(analyticsService.sendCommandErrorEvent).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockCliClientMetadata.databaseId,
        new CommandNotSupportedError(
          ERROR_MESSAGES.CLI_COMMAND_NOT_SUPPORTED(command.toUpperCase()),
        ),
        {
          command: 'script',
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });

    it('should return response with [CLI_UNTERMINATED_QUOTES] error for sendCommand', async () => {
      const command = mockGetEscapedKeyCommand;
      const dto: SendCommandDto = { command };
      const mockResult: SendCommandResponse = {
        response: ERROR_MESSAGES.CLI_UNTERMINATED_QUOTES(),
        status: CommandExecutionStatus.Fail,
      };

      const result = await service.sendCommand(mockCliClientMetadata, dto);

      expect(result).toEqual(mockResult);
      expect(analyticsService.sendCommandErrorEvent).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockCliClientMetadata.databaseId,
        new CommandParsingError(ERROR_MESSAGES.CLI_UNTERMINATED_QUOTES()),
        {
          command: unknownCommand,
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });

    it('should return response with redis reply error', async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        name: 'ReplyError',
        command: 'GET',
      };
      standaloneClient.sendCommand.mockRejectedValue(replyError);
      const dto: SendCommandDto = { command: 'get hashKey' };
      const mockResult: SendCommandResponse = {
        response: replyError.message,
        status: CommandExecutionStatus.Fail,
      };

      const result = await service.sendCommand(mockCliClientMetadata, dto);

      expect(result).toEqual(mockResult);
      expect(analyticsService.sendCommandErrorEvent).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockCliClientMetadata.databaseId,
        replyError,
        {
          command: 'get',
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });

    it('should return response with internal exception for sendCommand', async () => {
      const error = new Error(mockENotFoundMessage);
      const dto: SendCommandDto = { command: 'get key' };
      standaloneClient.sendCommand.mockRejectedValue(error);
      const mockResult: SendCommandResponse = {
        response: error.message,
        status: CommandExecutionStatus.Fail,
      };

      const result = await service.sendCommand(mockCliClientMetadata, dto);

      expect(result).toEqual(mockResult);
      expect(analyticsService.sendConnectionErrorEvent).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockCliClientMetadata.databaseId,
        new Error(mockENotFoundMessage),
        {
          command: 'get',
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });

    it('Should proxy EncryptionService errors for sendCommand', async () => {
      const dto: SendCommandDto = { command: 'get key' };
      standaloneClient.sendCommand.mockRejectedValue(
        new KeytarUnavailableException(),
      );

      try {
        await service.sendCommand(mockCliClientMetadata, dto);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(KeytarUnavailableException);
        expect(analyticsService.sendConnectionErrorEvent).toHaveBeenCalledWith(
          mockSessionMetadata,
          mockCliClientMetadata.databaseId,
          new KeytarUnavailableException(),
          {
            command: 'get',
            outputFormat: CliOutputFormatterTypes.Raw,
          },
        );
      }
    });

    it('should return response in correct format for human-readable commands for sendCommand', async () => {
      const dto: SendCommandDto = { command: mockServerInfoCommand };
      const mockResult: SendCommandResponse = {
        response: mockRedisServerInfoResponse,
        status: CommandExecutionStatus.Success,
      };
      when(standaloneClient.sendCommand)
        .calledWith(['info', 'server'], { replyEncoding: 'utf8' })
        .mockReturnValue(mockRedisServerInfoResponse);

      const result = await service.sendCommand(mockCliClientMetadata, dto);

      expect(result).toEqual(mockResult);
      expect(analyticsService.sendCommandExecutedEvent).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockCliClientMetadata.databaseId,
        {
          command: 'info',
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });

    it('should call recommendationService', async () => {
      const dto: SendCommandDto = { command: mockMemoryUsageCommand };
      const [command] = dto.command.split(' ');

      await service.sendCommand(mockCliClientMetadata, dto);

      expect(recommendationService.check).toBeCalledWith(
        mockCliClientMetadata,
        RECOMMENDATION_NAMES.SEARCH_VISUALIZATION,
        command,
      );
      expect(recommendationService.check).toBeCalledTimes(1);
    });
  });

  describe('sendClusterCommand', () => {
    beforeEach(async () => {
      databaseClientFactory.getOrCreateClient = jest
        .fn()
        .mockResolvedValue(clusterClient);
    });

    it('should successfully execute command (RAW format)', async () => {
      const dto: SendCommandDto = { command: mockMemoryUsageCommand };
      const formatSpy = jest.spyOn(rawFormatter, 'format');
      const mockResult: SendCommandResponse = {
        response: mockIntegerResponse,
        status: CommandExecutionStatus.Success,
      };
      when(clusterClient.sendCommand)
        .calledWith(['memory', 'usage', 'key'], expect.anything())
        .mockReturnValue(5);

      const result = await service.sendCommand(mockCliClientMetadata, dto);

      expect(result).toEqual(mockResult);
      expect(formatSpy).toHaveBeenCalled();
      expect(analyticsService.sendCommandExecutedEvent).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockCliClientMetadata.databaseId,
        {
          command: 'memory',
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });

    it('should successfully execute command and return raw response', async () => {
      const dto: SendCommandDto = {
        command: mockMemoryUsageCommand,
        outputFormat: CliOutputFormatterTypes.Raw,
      };
      const formatSpy = jest.spyOn(rawFormatter, 'format');
      const mockResult: SendCommandResponse = {
        response: 5,
        status: CommandExecutionStatus.Success,
      };
      when(clusterClient.sendCommand)
        .calledWith(['memory', 'usage', 'key'], expect.anything())
        .mockReturnValue(5);

      const result = await service.sendCommand(mockCliClientMetadata, dto);

      expect(result).toEqual(mockResult);
      expect(formatSpy).toHaveBeenCalled();
      expect(analyticsService.sendCommandExecutedEvent).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockCliClientMetadata.databaseId,
        {
          command: 'memory',
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });

    it('should return response with [CLI_COMMAND_NOT_SUPPORTED] error for sendCommand', async () => {
      const command = CliToolUnsupportedCommands.ScriptDebug;
      const dto: SendCommandDto = { command };
      const mockResult: SendCommandResponse = {
        response: ERROR_MESSAGES.CLI_COMMAND_NOT_SUPPORTED(
          command.toUpperCase(),
        ),
        status: CommandExecutionStatus.Fail,
      };

      const result = await service.sendCommand(mockCliClientMetadata, dto);

      expect(result).toEqual(mockResult);
      expect(analyticsService.sendCommandErrorEvent).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockCliClientMetadata.databaseId,
        new CommandNotSupportedError(
          ERROR_MESSAGES.CLI_COMMAND_NOT_SUPPORTED(command.toUpperCase()),
        ),
        {
          command: 'script',
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });

    it('should return response with [CLI_UNTERMINATED_QUOTES] error for sendCommand', async () => {
      const command = mockGetEscapedKeyCommand;
      const dto: SendCommandDto = { command };
      const mockResult: SendCommandResponse = {
        response: ERROR_MESSAGES.CLI_UNTERMINATED_QUOTES(),
        status: CommandExecutionStatus.Fail,
      };

      const result = await service.sendCommand(mockCliClientMetadata, dto);

      expect(result).toEqual(mockResult);
      expect(analyticsService.sendCommandErrorEvent).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockCliClientMetadata.databaseId,
        new CommandParsingError(ERROR_MESSAGES.CLI_UNTERMINATED_QUOTES()),
        {
          command: unknownCommand,
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });

    it('should return response with redis reply error', async () => {
      const replyError: ReplyError = {
        ...mockRedisWrongTypeError,
        name: 'ReplyError',
        command: 'GET',
      };
      clusterClient.sendCommand.mockRejectedValue(replyError);
      const dto: SendCommandDto = { command: 'get hashKey' };
      const mockResult: SendCommandResponse = {
        response: replyError.message,
        status: CommandExecutionStatus.Fail,
      };

      const result = await service.sendCommand(mockCliClientMetadata, dto);

      expect(result).toEqual(mockResult);
      expect(analyticsService.sendCommandErrorEvent).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockCliClientMetadata.databaseId,
        replyError,
        {
          command: 'get',
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });

    it('should return response with internal exception for sendCommand', async () => {
      const error = new Error(mockENotFoundMessage);
      const dto: SendCommandDto = { command: 'get key' };
      clusterClient.sendCommand.mockRejectedValue(error);
      const mockResult: SendCommandResponse = {
        response: error.message,
        status: CommandExecutionStatus.Fail,
      };

      const result = await service.sendCommand(mockCliClientMetadata, dto);

      expect(result).toEqual(mockResult);
      expect(analyticsService.sendConnectionErrorEvent).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockCliClientMetadata.databaseId,
        new Error(mockENotFoundMessage),
        {
          command: 'get',
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });

    it('Should proxy EncryptionService errors for sendCommand', async () => {
      const dto: SendCommandDto = { command: 'get key' };
      clusterClient.sendCommand.mockRejectedValue(
        new KeytarUnavailableException(),
      );

      try {
        await service.sendCommand(mockCliClientMetadata, dto);
        fail();
      } catch (err) {
        expect(err).toBeInstanceOf(KeytarUnavailableException);
        expect(analyticsService.sendConnectionErrorEvent).toHaveBeenCalledWith(
          mockSessionMetadata,
          mockCliClientMetadata.databaseId,
          new KeytarUnavailableException(),
          {
            command: 'get',
            outputFormat: CliOutputFormatterTypes.Raw,
          },
        );
      }
    });

    it('should return response in correct format for human-readable commands for sendCommand', async () => {
      const dto: SendCommandDto = { command: mockServerInfoCommand };
      const mockResult: SendCommandResponse = {
        response: mockRedisServerInfoResponse,
        status: CommandExecutionStatus.Success,
      };
      when(clusterClient.sendCommand)
        .calledWith(['info', 'server'], { replyEncoding: 'utf8' })
        .mockReturnValue(mockRedisServerInfoResponse);

      const result = await service.sendCommand(mockCliClientMetadata, dto);

      expect(result).toEqual(mockResult);
      expect(analyticsService.sendCommandExecutedEvent).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockCliClientMetadata.databaseId,
        {
          command: 'info',
          outputFormat: CliOutputFormatterTypes.Raw,
        },
      );
    });

    it('should call recommendationService', async () => {
      const dto: SendCommandDto = { command: mockMemoryUsageCommand };
      const [command] = dto.command.split(' ');

      await service.sendCommand(mockCliClientMetadata, dto);

      expect(recommendationService.check).toBeCalledWith(
        mockCliClientMetadata,
        RECOMMENDATION_NAMES.SEARCH_VISUALIZATION,
        command,
      );
      expect(recommendationService.check).toBeCalledTimes(1);
    });
  });
});
