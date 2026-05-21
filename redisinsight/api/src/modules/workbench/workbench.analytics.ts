import { HttpException, Injectable } from '@nestjs/common';
import { TelemetryEvents } from 'src/constants';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { RedisError, ReplyError } from 'src/models';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CommandsService } from 'src/modules/commands/commands.service';
import { CommandTelemetryBaseService } from 'src/modules/analytics/command.telemetry.base.service';
import { SessionMetadata } from 'src/common/models';
import { Database } from 'src/modules/database/models/database';
import { Environment } from 'src/modules/database/entities/database.entity';
import { DangerousCommandsProvider } from 'src/modules/database/providers/dangerous-commands.provider';
import { RedisClient } from 'src/modules/redis/client';
import { CommandExecutionType } from './models/command-execution';

export interface IExecResult {
  response: any;
  status: CommandExecutionStatus;
  error?: RedisError | ReplyError | Error;
}

export interface WorkbenchCommandEventData {
  command?: string;
  rawMode?: boolean;
}

@Injectable()
export class WorkbenchAnalytics extends CommandTelemetryBaseService {
  constructor(
    protected eventEmitter: EventEmitter2,
    protected readonly commandsService: CommandsService,
    private readonly dangerousCommandsProvider: DangerousCommandsProvider,
  ) {
    super(eventEmitter, commandsService);
  }

  async sendIndexInfoEvent(
    sessionMetadata: SessionMetadata,
    database: Database,
    commandExecutionType: CommandExecutionType,
    additionalData: object | null,
  ): Promise<void> {
    if (!additionalData) {
      return;
    }

    try {
      const event =
        commandExecutionType === CommandExecutionType.Search
          ? TelemetryEvents.SearchIndexInfoSubmitted
          : TelemetryEvents.WorkbenchIndexInfoSubmitted;

      this.sendEvent(sessionMetadata, event, {
        databaseId: database.id,
        ...additionalData,
        environment: database.environment ?? Environment.Unspecified,
      });
    } catch (e) {
      // ignore error
    }
  }

  public async sendCommandExecutedEvents(
    sessionMetadata: SessionMetadata,
    database: Database,
    commandExecutionType: CommandExecutionType,
    results: IExecResult[],
    client: RedisClient | undefined,
    additionalData: WorkbenchCommandEventData = {},
  ): Promise<void> {
    try {
      // Resolve isDangerous once for the whole batch — every result shares
      // the same command. Environment is already on `database`.
      const isDangerous = (await this.dangerousCommandsProvider.isDangerous(
        client,
        additionalData.command,
      ))
        ? 'true'
        : 'false';

      await Promise.all(
        results.map((result) =>
          this.emitCommandExecuted(
            sessionMetadata,
            database,
            commandExecutionType,
            result,
            additionalData,
            isDangerous,
          ),
        ),
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  public async sendCommandExecutedEvent(
    sessionMetadata: SessionMetadata,
    database: Database,
    commandExecutionType: CommandExecutionType,
    result: IExecResult,
    client: RedisClient | undefined,
    additionalData: WorkbenchCommandEventData = {},
  ): Promise<void> {
    try {
      const isDangerous = (await this.dangerousCommandsProvider.isDangerous(
        client,
        additionalData.command,
      ))
        ? 'true'
        : 'false';

      await this.emitCommandExecuted(
        sessionMetadata,
        database,
        commandExecutionType,
        result,
        additionalData,
        isDangerous,
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  private async emitCommandExecuted(
    sessionMetadata: SessionMetadata,
    database: Database,
    commandExecutionType: CommandExecutionType,
    result: IExecResult,
    additionalData: WorkbenchCommandEventData,
    isDangerous: 'true' | 'false',
  ): Promise<void> {
    const { status } = result;
    try {
      const { command } = additionalData;
      const environment = database.environment ?? Environment.Unspecified;

      if (status === CommandExecutionStatus.Success) {
        const event =
          commandExecutionType === CommandExecutionType.Search
            ? TelemetryEvents.SearchCommandExecuted
            : TelemetryEvents.WorkbenchCommandExecuted;

        this.sendEvent(sessionMetadata, event, {
          databaseId: database.id,
          ...(await this.getCommandAdditionalInfo(command)),
          ...additionalData,
          environment,
          isDangerous,
        });
      }
      if (status === CommandExecutionStatus.Fail) {
        await this.sendCommandErrorEvent(
          sessionMetadata,
          database,
          result.error,
          commandExecutionType,
          additionalData,
          isDangerous,
        );
      }
    } catch (e) {
      // continue regardless of error
    }
  }

  sendCommandDeletedEvent(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    additionalData: object = {},
  ): void {
    this.sendEvent(sessionMetadata, TelemetryEvents.WorkbenchCommandDeleted, {
      databaseId,
      ...additionalData,
    });
  }

  private async sendCommandErrorEvent(
    sessionMetadata: SessionMetadata,
    database: Database,
    error: any,
    commandExecutionType: CommandExecutionType,
    additionalData: WorkbenchCommandEventData = {},
    isDangerous: 'true' | 'false' = 'false',
  ): Promise<void> {
    try {
      const event =
        commandExecutionType === CommandExecutionType.Search
          ? TelemetryEvents.SearchCommandErrorReceived
          : TelemetryEvents.WorkbenchCommandErrorReceived;

      const { command } = additionalData;
      const commandInfo = await this.getCommandAdditionalInfo(command);
      const environment = database.environment ?? Environment.Unspecified;

      if (error instanceof HttpException) {
        this.sendFailedEvent(sessionMetadata, event, error, {
          databaseId: database.id,
          ...commandInfo,
          ...additionalData,
          environment,
          isDangerous,
        });
      } else {
        this.sendEvent(sessionMetadata, event, {
          databaseId: database.id,
          error: error.name,
          command: error?.command?.name,
          ...commandInfo,
          ...additionalData,
          environment,
          isDangerous,
        });
      }
    } catch (e) {
      // continue regardless of error
    }
  }
}
