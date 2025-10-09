import { Test, TestingModule } from '@nestjs/testing';
import { get } from 'lodash';
import {
  mockDatabaseClientFactory,
  mockFtInfoAnalyticsData,
  mockRedisFtInfoReply,
  mockSessionMetadata,
  mockStandaloneRedisClient,
  mockWorkbenchAnalyticsService,
  mockWorkbenchClientMetadata,
} from 'src/__mocks__';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { unknownCommand } from 'src/constants';
import { WorkbenchCommandsExecutor } from 'src/modules/workbench/providers/workbench-commands.executor';
import { CreateCommandExecutionDto } from 'src/modules/workbench/dto/create-command-execution.dto';
import { CommandExecutionResult } from 'src/modules/workbench/models/command-execution-result';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { ServiceUnavailableException } from '@nestjs/common';
import {
  CommandNotSupportedError,
  CommandParsingError,
} from 'src/modules/cli/constants/errors';
import {
  FormatterManager,
  IFormatterStrategy,
  FormatterTypes,
} from 'src/common/transformers';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import {
  CommandExecutionType,
  RunQueryMode,
} from 'src/modules/workbench/models/command-execution';
import { WorkbenchAnalytics } from 'src/modules/workbench/workbench.analytics';

const MOCK_ERROR_MESSAGE = 'Some error';

const mockSetCommand = 'set';
const mockGetEscapedKeyCommand = 'get "\\\\key';
const mockCreateCommandExecutionDto: CreateCommandExecutionDto = {
  command: `${mockSetCommand} foo bar`,
  mode: RunQueryMode.ASCII,
};

const mockCommandExecutionResult: CommandExecutionResult = {
  response: 'OK',
  status: CommandExecutionStatus.Success,
};

const mockAnalyticsService = mockWorkbenchAnalyticsService();

describe('WorkbenchCommandsExecutor', () => {
  const client = mockStandaloneRedisClient;
  let service: WorkbenchCommandsExecutor;
  let utf8Formatter: IFormatterStrategy;
  let asciiFormatter: IFormatterStrategy;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkbenchCommandsExecutor,
        {
          provide: WorkbenchAnalytics,
          useFactory: () => mockAnalyticsService,
        },
        {
          provide: DatabaseClientFactory,
          useFactory: mockDatabaseClientFactory,
        },
      ],
    }).compile();

    service = module.get<WorkbenchCommandsExecutor>(WorkbenchCommandsExecutor);

    const formatterManager: FormatterManager = get(service, 'formatterManager');
    utf8Formatter = formatterManager.getStrategy(FormatterTypes.UTF8);
    asciiFormatter = formatterManager.getStrategy(FormatterTypes.ASCII);

    client.sendCommand = jest.fn().mockResolvedValue(undefined);
  });

  describe('sendCommand', () => {
    describe('sendCommandForStandalone', () => {
      it('should successfully send ft.info', async () => {
        client.sendCommand.mockResolvedValueOnce(mockRedisFtInfoReply);

        const result = await service.sendCommand(client, {
          command: 'ft.info idx',
          mode: RunQueryMode.Raw,
          type: CommandExecutionType.Workbench,
        });

        expect(result).toEqual([
          {
            response: mockRedisFtInfoReply,
            status: mockCommandExecutionResult.status,
          },
        ]);

        expect(
          mockAnalyticsService.sendCommandExecutedEvents,
        ).toHaveBeenCalledWith(
          mockSessionMetadata,
          mockWorkbenchClientMetadata.databaseId,
          CommandExecutionType.Workbench,
          [
            {
              response: mockRedisFtInfoReply,
              status: CommandExecutionStatus.Success,
            },
          ],
          {
            command: 'ft.info',
            rawMode: true,
          },
        );
        expect(mockAnalyticsService.sendIndexInfoEvent).toHaveBeenCalledWith(
          mockSessionMetadata,
          mockWorkbenchClientMetadata.databaseId,
          CommandExecutionType.Workbench,
          mockFtInfoAnalyticsData,
        );
      });
      it('should successfully send command for standalone', async () => {
        client.sendCommand.mockResolvedValueOnce('OK');

        const result = await service.sendCommand(client, {
          command: mockCreateCommandExecutionDto.command,
          mode: RunQueryMode.ASCII,
          type: CommandExecutionType.Workbench,
        });

        expect(result).toEqual([
          {
            response: mockCommandExecutionResult.response,
            status: mockCommandExecutionResult.status,
          },
        ]);

        expect(
          mockAnalyticsService.sendCommandExecutedEvents,
        ).toHaveBeenCalledWith(
          mockSessionMetadata,
          mockWorkbenchClientMetadata.databaseId,
          CommandExecutionType.Workbench,
          [
            {
              response: mockCommandExecutionResult.response,
              status: CommandExecutionStatus.Success,
            },
          ],
          {
            command: mockSetCommand,
            rawMode: false,
          },
        );
      });
      it('should return fail status in case of unsupported command error', async () => {
        client.sendCommand.mockRejectedValueOnce(
          new CommandNotSupportedError(MOCK_ERROR_MESSAGE),
        );

        const result = await service.sendCommand(client, {
          command: mockCreateCommandExecutionDto.command,
          mode: RunQueryMode.ASCII,
          type: CommandExecutionType.Workbench,
        });

        expect(result).toEqual([
          {
            response: MOCK_ERROR_MESSAGE,
            status: CommandExecutionStatus.Fail,
          },
        ]);

        expect(
          mockAnalyticsService.sendCommandExecutedEvent,
        ).toHaveBeenCalledWith(
          mockSessionMetadata,
          mockWorkbenchClientMetadata.databaseId,
          CommandExecutionType.Workbench,
          {
            response: MOCK_ERROR_MESSAGE,
            error: new CommandNotSupportedError(MOCK_ERROR_MESSAGE),
            status: CommandExecutionStatus.Fail,
          },
          {
            command: mockSetCommand,
            rawMode: false,
          },
        );
      });
      it('should return fail status when replyError happened', async () => {
        const replyError: Error = {
          message: MOCK_ERROR_MESSAGE,
          name: 'ReplyError',
        };

        client.sendCommand.mockRejectedValueOnce(replyError);

        const result = await service.sendCommand(client, {
          command: mockCreateCommandExecutionDto.command,
          mode: RunQueryMode.ASCII,
          type: CommandExecutionType.Workbench,
        });

        expect(result).toEqual([
          {
            response: MOCK_ERROR_MESSAGE,
            status: CommandExecutionStatus.Fail,
          },
        ]);

        expect(
          mockAnalyticsService.sendCommandExecutedEvent,
        ).toHaveBeenCalledWith(
          mockSessionMetadata,
          mockWorkbenchClientMetadata.databaseId,
          CommandExecutionType.Workbench,
          {
            response: MOCK_ERROR_MESSAGE,
            error: replyError,
            status: CommandExecutionStatus.Fail,
          },
          {
            command: mockSetCommand,
            rawMode: false,
          },
        );
      });
      it('should successfully execute command and return ascii response', async () => {
        const formatSpy = jest.spyOn(asciiFormatter, 'format');

        client.sendCommand.mockResolvedValueOnce(
          mockCommandExecutionResult.response,
        );

        const result = await service.sendCommand(client, {
          command: mockCreateCommandExecutionDto.command,
          mode: RunQueryMode.ASCII,
          type: CommandExecutionType.Workbench,
        });

        expect(result).toEqual([
          {
            response: mockCommandExecutionResult.response,
            status: mockCommandExecutionResult.status,
          },
        ]);
        expect(formatSpy).toHaveBeenCalled();

        expect(
          mockAnalyticsService.sendCommandExecutedEvents,
        ).toHaveBeenCalledWith(
          mockSessionMetadata,
          mockWorkbenchClientMetadata.databaseId,
          CommandExecutionType.Workbench,
          [
            {
              response: mockCommandExecutionResult.response,
              status: CommandExecutionStatus.Success,
            },
          ],
          {
            command: mockSetCommand,
            rawMode: false,
          },
        );
      });
      it('should successfully execute command and return raw response', async () => {
        const formatSpy = jest.spyOn(utf8Formatter, 'format');

        client.sendCommand.mockResolvedValueOnce(
          mockCommandExecutionResult.response,
        );

        const result = await service.sendCommand(client, {
          command: mockCreateCommandExecutionDto.command,
          mode: RunQueryMode.Raw,
          type: CommandExecutionType.Workbench,
        });

        expect(result).toEqual([
          {
            response: mockCommandExecutionResult.response,
            status: mockCommandExecutionResult.status,
          },
        ]);
        expect(formatSpy).toHaveBeenCalled();

        expect(
          mockAnalyticsService.sendCommandExecutedEvents,
        ).toHaveBeenCalledWith(
          mockSessionMetadata,
          mockWorkbenchClientMetadata.databaseId,
          CommandExecutionType.Workbench,
          [
            {
              response: mockCommandExecutionResult.response,
              status: CommandExecutionStatus.Success,
            },
          ],
          {
            command: mockSetCommand,
            rawMode: true,
          },
        );
      });
      it('should return fail status when on unexpected error', async () => {
        client.sendCommand.mockRejectedValueOnce(
          new ServiceUnavailableException(MOCK_ERROR_MESSAGE),
        );

        const result = await service.sendCommand(client, {
          command: mockCreateCommandExecutionDto.command,
          mode: RunQueryMode.ASCII,
          type: CommandExecutionType.Workbench,
        });

        expect(result).toEqual([
          {
            response: MOCK_ERROR_MESSAGE,
            status: CommandExecutionStatus.Fail,
          },
        ]);

        expect(
          mockAnalyticsService.sendCommandExecutedEvent,
        ).toHaveBeenCalledWith(
          mockSessionMetadata,
          mockWorkbenchClientMetadata.databaseId,
          CommandExecutionType.Workbench,
          {
            response: MOCK_ERROR_MESSAGE,
            error: new ServiceUnavailableException(MOCK_ERROR_MESSAGE),
            status: CommandExecutionStatus.Fail,
          },
          {
            command: mockSetCommand,
            rawMode: false,
          },
        );
      });
    });
    describe('CommandParsingError', () => {
      it('should return response with [CLI_UNTERMINATED_QUOTES] error for sendCommandForNodes', async () => {
        const mockResult = [
          {
            response: ERROR_MESSAGES.CLI_UNTERMINATED_QUOTES(),
            status: CommandExecutionStatus.Fail,
          },
        ];

        const result = await service.sendCommand(client, {
          command: mockGetEscapedKeyCommand,
          mode: RunQueryMode.ASCII,
          type: CommandExecutionType.Workbench,
        });

        expect(result).toEqual(mockResult);
        expect(
          mockAnalyticsService.sendCommandExecutedEvent,
        ).toHaveBeenCalledWith(
          mockSessionMetadata,
          mockWorkbenchClientMetadata.databaseId,
          CommandExecutionType.Workbench,
          {
            response: ERROR_MESSAGES.CLI_UNTERMINATED_QUOTES(),
            error: new CommandParsingError(
              ERROR_MESSAGES.CLI_UNTERMINATED_QUOTES(),
            ),
            status: CommandExecutionStatus.Fail,
          },
          {
            command: unknownCommand,
            rawMode: false,
          },
        );
      });
    });
  });
});
