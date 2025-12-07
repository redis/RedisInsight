import { v4 as uuidv4 } from 'uuid';
import {
  CommandExecution,
  CommandExecutionType,
  ResultsMode,
  RunQueryMode,
} from 'src/modules/workbench/models/command-execution';
import { CommandExecutionEntity } from 'src/modules/workbench/entities/command-execution.entity';
import { mockDatabase } from 'src/__mocks__/databases';
import { CommandExecutionResult } from 'src/modules/workbench/models/command-execution-result';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { CreateCommandExecutionDto } from 'src/modules/workbench/dto/create-command-execution.dto';
import { ShortCommandExecution } from 'src/modules/workbench/models/short-command-execution';
import { CommandExecutionFilter } from 'src/modules/workbench/models/command-executions.filter';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { PluginCommandExecution } from 'src/modules/workbench/models/plugin-command-execution';

export const mockCommandExecutionUnsupportedCommandResult = Object.assign(
  new CommandExecutionResult(),
  {
    response: ERROR_MESSAGES.PLUGIN_COMMAND_NOT_SUPPORTED(
      'subscribe'.toUpperCase(),
    ),
    status: CommandExecutionStatus.Fail,
  },
);

export const mockCommandExecutionSuccessResult = Object.assign(
  new CommandExecutionResult(),
  {
    status: CommandExecutionStatus.Success,
    response: 'bar',
  },
);

export const mockCommendExecutionHugeResultPlaceholder = Object.assign(
  new CommandExecutionResult(),
  {
    status: CommandExecutionStatus.Success,
    response:
      'Results have been deleted since they exceed 1 MB. Re-run the command to see new results.',
    sizeLimitExceeded: true,
  },
);

export const mockCommendExecutionHugeResultPlaceholderEncrypted =
  'huge_result_placeholder_encrypted';

export const mockCommandExecution = Object.assign(new CommandExecution(), {
  id: uuidv4(),
  databaseId: mockDatabase.id,
  command: 'get foo',
  mode: RunQueryMode.ASCII,
  resultsMode: ResultsMode.Default,
  type: CommandExecutionType.Workbench,
  result: [mockCommandExecutionSuccessResult],
  createdAt: new Date(),
  db: 0,
});

export const mockCommandExecutionEntity = Object.assign(
  new CommandExecutionEntity(),
  {
    ...mockCommandExecution,
    command: 'encrypted_command',
    result: `${JSON.stringify([mockCommandExecutionSuccessResult])}_encrypted`,
    encryption: 'KEYTAR',
  },
);

export const mockShortCommandExecution = Object.assign(
  new ShortCommandExecution(),
  {
    id: mockCommandExecution.id,
    databaseId: mockCommandExecution.id,
    command: mockCommandExecution.command,
    createdAt: mockCommandExecution.createdAt,
    mode: mockCommandExecution.mode,
    summary: mockCommandExecution.summary,
    resultsMode: mockCommandExecution.resultsMode,
    executionTime: mockCommandExecution.executionTime,
    db: mockCommandExecution.db,
    type: mockCommandExecution.type,
  },
);

export const mockShortCommandExecutionEntity = Object.assign(
  new CommandExecutionEntity(),
  {
    ...mockShortCommandExecution,
    command: mockCommandExecutionEntity.command,
    encryption: mockCommandExecutionEntity.encryption,
  },
);

export const mockCreateCommandExecutionDto = Object.assign(
  new CreateCommandExecutionDto(),
  {
    command: mockCommandExecution.command,
    mode: mockCommandExecution.mode,
    resultsMode: mockCommandExecution.resultsMode,
    type: mockCommandExecution.type,
  },
);

export const mockCommandExecutionFilter = Object.assign(
  new CommandExecutionFilter(),
  {
    type: mockCommandExecution.type,
  },
);

export const mockPluginCommandExecution = Object.assign(
  new PluginCommandExecution(),
  {
    ...mockCreateCommandExecutionDto,
    databaseId: mockDatabase.id,
    result: [mockCommandExecutionSuccessResult],
  },
);

export const mockWorkbenchCommandsExecutor = () => ({
  sendCommand: jest.fn().mockResolvedValue([mockCommandExecutionSuccessResult]),
});

export const mockCommandExecutionRepository = () => ({
  createMany: jest.fn().mockResolvedValue([mockCommandExecution]),
  getList: jest.fn().mockResolvedValue([mockCommandExecution]),
  getOne: jest.fn().mockResolvedValue(mockCommandExecution),
  delete: jest.fn(),
  deleteAll: jest.fn(),
});
