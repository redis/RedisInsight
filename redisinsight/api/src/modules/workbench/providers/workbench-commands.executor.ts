import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import {
  checkHumanReadableCommands,
  splitCliCommandLine,
} from 'src/utils/cli-helper';
import {
  CommandNotSupportedError,
  CommandParsingError,
  ClusterNodeNotFoundError,
  WrongDatabaseTypeError,
} from 'src/modules/cli/constants/errors';
import { unknownCommand } from 'src/constants';
import { CommandExecutionResult } from 'src/modules/workbench/models/command-execution-result';
import { CreateCommandExecutionDto } from 'src/modules/workbench/dto/create-command-execution.dto';
import {
  FormatterManager,
  FormatterTypes,
  ASCIIFormatterStrategy,
  UTF8FormatterStrategy,
} from 'src/common/transformers';
import { RedisClient } from 'src/modules/redis/client';
import { getAnalyticsDataFromIndexInfo } from 'src/utils';
import { RunQueryMode } from 'src/modules/workbench/models/command-execution';
import { WorkbenchAnalytics } from 'src/modules/workbench/workbench.analytics';
import { DatabaseService } from 'src/modules/database/database.service';
import { Database } from 'src/modules/database/models/database';
import { DangerousCommandsProvider } from 'src/modules/database/providers/dangerous-commands.provider';

@Injectable()
export class WorkbenchCommandsExecutor {
  private logger = new Logger('WorkbenchCommandsExecutor');

  private formatterManager: FormatterManager;

  constructor(
    private analyticsService: WorkbenchAnalytics,
    private readonly databaseService: DatabaseService,
    private readonly dangerousCommandsProvider: DangerousCommandsProvider,
  ) {
    this.formatterManager = new FormatterManager();
    this.formatterManager.addStrategy(
      FormatterTypes.UTF8,
      new UTF8FormatterStrategy(),
    );
    this.formatterManager.addStrategy(
      FormatterTypes.ASCII,
      new ASCIIFormatterStrategy(),
    );
  }

  /**
   * Entrypoint for any CommandExecution
   * Will determine type of command (standalone, per node(s)) and format, and execute it
   * Also sis a single place of analytics events invocation
   * @param client
   * @param dto
   */
  public async sendCommand(
    client: RedisClient,
    dto: CreateCommandExecutionDto,
  ): Promise<CommandExecutionResult[]> {
    this.logger.debug('Executing workbench command.');
    let command = unknownCommand;
    let commandArgs: string[] = [];
    let database: Database | undefined;
    let isDangerous: 'true' | 'false' = 'false';

    // Resolve once so analytics emits get environment without each method
    // doing its own repository lookup. Failure is non-fatal — analytics
    // calls check for undefined and skip the emit.
    try {
      database = await this.databaseService.get(
        client.clientMetadata.sessionMetadata,
        client.clientMetadata.databaseId,
      );
    } catch (e) {
      // proceed without database — environment will be unknown
    }

    try {
      const { command: commandLine, mode } = dto;
      [command, ...commandArgs] = splitCliCommandLine(commandLine);

      // Resolve dangerous flag against the parsed command. If parsing throws
      // above, `isDangerous` stays `'false'` (we don't know the command) and
      // the error emit in `catch` uses that default.
      isDangerous = (await this.dangerousCommandsProvider.isDangerous(
        client,
        command,
      ))
        ? 'true'
        : 'false';

      const formatter = this.getFormatter(mode);
      const replyEncoding = checkHumanReadableCommands(
        `${command} ${commandArgs[0]}`,
      )
        ? 'utf8'
        : undefined;

      const response = formatter.format(
        await client.sendCommand([command, ...commandArgs], { replyEncoding }),
      );
      const result: CommandExecutionResult[] = [
        { response, status: CommandExecutionStatus.Success },
      ];

      this.logger.debug('Succeed to execute workbench command.');
      if (database) {
        this.analyticsService.sendCommandExecutedEvents(
          client.clientMetadata.sessionMetadata,
          database,
          dto.type,
          result,
          isDangerous,
          {
            command,
            rawMode: mode === RunQueryMode.Raw,
          },
        );

        if (command.toLowerCase() === 'ft.info') {
          this.analyticsService.sendIndexInfoEvent(
            client.clientMetadata.sessionMetadata,
            database,
            dto.type,
            getAnalyticsDataFromIndexInfo(response as string[]),
          );
        }
      }

      return result;
    } catch (error) {
      this.logger.error('Failed to execute workbench command.', error);

      const errorResult = {
        response: error.message,
        status: CommandExecutionStatus.Fail,
      };
      if (database) {
        this.analyticsService.sendCommandExecutedEvent(
          client.clientMetadata.sessionMetadata,
          database,
          dto.type,
          { ...errorResult, error },
          isDangerous,
          {
            command,
            rawMode: dto.mode === RunQueryMode.Raw,
          },
        );
      }

      if (
        error instanceof CommandParsingError ||
        error instanceof CommandNotSupportedError ||
        error.name === 'ReplyError'
      ) {
        return [errorResult];
      }

      if (
        error instanceof WrongDatabaseTypeError ||
        error instanceof ClusterNodeNotFoundError
      ) {
        throw new BadRequestException(error.message);
      }

      return [errorResult];
    }
  }

  /**
   * Get formatter strategy based on "mode"
   * @param mode
   * @private
   */
  private getFormatter(mode: RunQueryMode) {
    switch (mode) {
      case RunQueryMode.Raw:
        return this.formatterManager.getStrategy(FormatterTypes.UTF8);
      case RunQueryMode.ASCII:
      default: {
        return this.formatterManager.getStrategy(FormatterTypes.ASCII);
      }
    }
  }
}
