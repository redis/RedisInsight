import { Test, TestingModule } from '@nestjs/testing';
import {
  mockClientMetadata,
  mockCommandExecutionUnsupportedCommandResult,
  mockCreateCommandExecutionDto,
  mockDatabaseClientFactory,
  mockPluginCommandExecution,
  mockWhitelistCommandsResponse,
  mockWorkbenchClientMetadata,
  mockWorkbenchCommandsExecutor,
} from 'src/__mocks__';
import { v4 as uuidv4 } from 'uuid';
import { WorkbenchCommandsExecutor } from 'src/modules/workbench/providers/workbench-commands.executor';
import { BadRequestException } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { PluginsService } from 'src/modules/workbench/plugins.service';
import { PluginCommandsWhitelistProvider } from 'src/modules/workbench/providers/plugin-commands-whitelist.provider';
import { PluginStateRepository } from 'src/modules/workbench/repositories/plugin-state.repository';
import { PluginState } from 'src/modules/workbench/models/plugin-state';
import config from 'src/utils/config';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import {
  CommandExecutionType,
  ResultsMode,
  RunQueryMode,
} from 'src/modules/workbench/models/command-execution';

const PLUGINS_CONFIG = config.get('plugins');

const mockVisualizationId = 'pluginName_visualizationName';
const mockCommandExecutionId = uuidv4();
const mockState = {
  some: 'object',
};

const mockPluginState: PluginState = new PluginState({
  visualizationId: mockVisualizationId,
  commandExecutionId: mockCommandExecutionId,
  state: mockState,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const mockPluginCommandsWhitelistProvider = () => ({
  getWhitelistCommands: jest.fn(),
});

const mockPluginStateProvider = () => ({
  upsert: jest.fn(),
  getOne: jest.fn(),
});

describe('PluginsService', () => {
  let service: PluginsService;
  let workbenchCommandsExecutor;
  let pluginsCommandsWhitelistProvider;
  let pluginStateProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PluginsService,
        {
          provide: WorkbenchCommandsExecutor,
          useFactory: mockWorkbenchCommandsExecutor,
        },
        {
          provide: PluginCommandsWhitelistProvider,
          useFactory: mockPluginCommandsWhitelistProvider,
        },
        {
          provide: PluginStateRepository,
          useFactory: mockPluginStateProvider,
        },
        {
          provide: DatabaseClientFactory,
          useFactory: mockDatabaseClientFactory,
        },
      ],
    }).compile();

    service = module.get<PluginsService>(PluginsService);
    workbenchCommandsExecutor = module.get<WorkbenchCommandsExecutor>(
      WorkbenchCommandsExecutor,
    );
    pluginsCommandsWhitelistProvider =
      module.get<PluginCommandsWhitelistProvider>(
        PluginCommandsWhitelistProvider,
      );
    pluginStateProvider = module.get(PluginStateRepository);
  });

  describe('sendCommand', () => {
    it('should successfully execute command', async () => {
      pluginsCommandsWhitelistProvider.getWhitelistCommands.mockResolvedValueOnce(
        mockWhitelistCommandsResponse,
      );

      const result = await service.sendCommand(
        mockWorkbenchClientMetadata,
        mockCreateCommandExecutionDto,
      );

      expect(result).toEqual(mockPluginCommandExecution);
      expect(workbenchCommandsExecutor.sendCommand).toHaveBeenCalled();
    });
    it('should return status failed when unsupported command called', async () => {
      const dto = {
        command: 'subscribe',
        mode: RunQueryMode.ASCII,
      };

      pluginsCommandsWhitelistProvider.getWhitelistCommands.mockResolvedValueOnce(
        mockWhitelistCommandsResponse,
      );

      const result = await service.sendCommand(
        mockWorkbenchClientMetadata,
        dto,
      );

      expect(result).toEqual({
        ...dto,
        databaseId: mockWorkbenchClientMetadata.databaseId,
        result: [mockCommandExecutionUnsupportedCommandResult],
        resultsMode: ResultsMode.Default,
        type: CommandExecutionType.Workbench,
      });
      expect(workbenchCommandsExecutor.sendCommand).not.toHaveBeenCalled();
    });
    it('should throw an error when command execution failed', async () => {
      pluginsCommandsWhitelistProvider.getWhitelistCommands.mockResolvedValueOnce(
        mockWhitelistCommandsResponse,
      );
      workbenchCommandsExecutor.sendCommand.mockRejectedValueOnce(
        new BadRequestException('error'),
      );

      const dto = {
        command: 'get foo',
        mode: RunQueryMode.ASCII,
      };

      try {
        await service.sendCommand(mockWorkbenchClientMetadata, dto);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });
  });
  describe('getWhitelistCommands', () => {
    it('should successfully return whitelisted commands', async () => {
      pluginsCommandsWhitelistProvider.getWhitelistCommands.mockResolvedValueOnce(
        mockWhitelistCommandsResponse,
      );

      const result = await service.getWhitelistCommands(
        mockWorkbenchClientMetadata,
      );

      expect(result).toEqual(mockWhitelistCommandsResponse);
    });
  });
  describe('saveState', () => {
    it('should successfully save state', async () => {
      pluginStateProvider.upsert.mockResolvedValueOnce(mockPluginState);

      const dto = {
        state: mockState,
      };
      const result = await service.saveState(
        mockClientMetadata,
        mockVisualizationId,
        mockCommandExecutionId,
        dto,
      );

      expect(result).toEqual(undefined);
    });
    it('should throw an error when state too large', async () => {
      pluginStateProvider.upsert.mockResolvedValueOnce(mockPluginState);

      try {
        const dto = {
          state: Buffer.alloc(PLUGINS_CONFIG.stateMaxSize + 1, 0),
        };
        await service.saveState(
          mockClientMetadata,
          mockVisualizationId,
          mockCommandExecutionId,
          dto,
        );
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual(
          ERROR_MESSAGES.PLUGIN_STATE_MAX_SIZE(PLUGINS_CONFIG.stateMaxSize),
        );
      }
      expect(pluginStateProvider.upsert).not.toHaveBeenCalled();
    });
  });
  describe('getState', () => {
    it('should successfully get state', async () => {
      pluginStateProvider.getOne.mockResolvedValueOnce(mockPluginState);

      const result = await service.getState(
        mockClientMetadata,
        mockVisualizationId,
        mockCommandExecutionId,
      );

      expect(result).toEqual(mockPluginState);
    });
  });
});
