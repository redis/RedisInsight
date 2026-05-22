import { HttpException, Injectable } from '@nestjs/common';
import { TelemetryEvents } from 'src/constants';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { RedisError, ReplyError } from 'src/models';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CommandsService } from 'src/modules/commands/commands.service';
import { CommandTelemetryBaseService } from 'src/modules/analytics/command.telemetry.base.service';
import { SessionMetadata } from 'src/common/models';
import { Environment } from 'src/modules/database/entities/database.entity';
import { CommandExecutionType } from './models/command-execution';

export interface IExecResult {
  response: any;
  status: CommandExecutionStatus;
  error?: RedisError | ReplyError | Error;
}

export interface WorkbenchCommandEventData {
  command?: string;
  rawMode?: boolean;
  environment?: Environment;
  isDangerous?: 'true' | 'false';
}

@Injectable()
export class WorkbenchAnalytics extends CommandTelemetryBaseService {
  constructor(
    protected eventEmitter: EventEmitter2,
    protected readonly commandsService: CommandsService,
  ) {
    super(eventEmitter, commandsService);
  }

  async sendIndexInfoEvent(
    sessionMetadata: SessionMetadata,
    databaseId: string,
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
        databaseId,
        ...additionalData,
      });
    } catch (e) {
      // ignore error
    }
  }

  public async sendCommandExecutedEvents(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    commandExecutionType: CommandExecutionType,
    results: IExecResult[],
    additionalData: WorkbenchCommandEventData = {},
  ): Promise<void> {
    try {
      await Promise.all(
        results.map((result) =>
          this.sendCommandExecutedEvent(
            sessionMetadata,
            databaseId,
            commandExecutionType,
            result,
            additionalData,
          ),
        ),
      );
    } catch (e) {
      // continue regardless of error
    }
  }

  public async sendCommandExecutedEvent(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    commandExecutionType: CommandExecutionType,
    result: IExecResult,
    additionalData: WorkbenchCommandEventData = {},
  ): Promise<void> {
    const { status } = result;
    try {
      const { command } = additionalData;
      if (status === CommandExecutionStatus.Success) {
        const event =
          commandExecutionType === CommandExecutionType.Search
            ? TelemetryEvents.SearchCommandExecuted
            : TelemetryEvents.WorkbenchCommandExecuted;

        this.sendEvent(sessionMetadata, event, {
          databaseId,
          ...(await this.getCommandAdditionalInfo(command)),
          ...additionalData,
        });
      }
      if (status === CommandExecutionStatus.Fail) {
        await this.sendCommandErrorEvent(
          sessionMetadata,
          databaseId,
          result.error,
          commandExecutionType,
          additionalData,
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
    databaseId: string,
    error: any,
    commandExecutionType: CommandExecutionType,
    additionalData: WorkbenchCommandEventData = {},
  ): Promise<void> {
    try {
      const event =
        commandExecutionType === CommandExecutionType.Search
          ? TelemetryEvents.SearchCommandErrorReceived
          : TelemetryEvents.WorkbenchCommandErrorReceived;

      const { command } = additionalData;
      const commandInfo = await this.getCommandAdditionalInfo(command);

      if (error instanceof HttpException) {
        this.sendFailedEvent(sessionMetadata, event, error, {
          databaseId,
          ...commandInfo,
          ...additionalData,
        });
      } else {
        this.sendEvent(sessionMetadata, event, {
          databaseId,
          error: error.name,
          command: error?.command?.name,
          ...commandInfo,
          ...additionalData,
        });
      }
    } catch (e) {
      // continue regardless of error
    }
  }
}
